// src/worker/MatchPrecomputeWorker.ts
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

import { QuadrantUtils } from "@akshay-na/exoframe/lib/common/QuadrantUtils";
import { MatchingEngine } from "../engines/MatchingEngine";
import ProfileModel, { IProfile } from "../models/ProfileModel";

const zsetKey = (q: string, uid: string) => `Q:${q}:${uid}`;
const indexKey = (q: string) => `IDX:${q}`;

export class MatchPrecomputeWorker {
  private static _instance: MatchPrecomputeWorker | null = null;

  public static init(
    redis: Redis,
    opts?: { topK?: number; concurrency?: number }
  ): MatchPrecomputeWorker {
    if (MatchPrecomputeWorker._instance)
      throw new Error("MatchPrecomputeWorker already initialised");

    MatchPrecomputeWorker._instance = new MatchPrecomputeWorker(
      redis,
      opts?.topK ?? 5,
      opts?.concurrency ?? 4
    );
    return MatchPrecomputeWorker._instance;
  }

  /** Safe accessor from any other file */
  public static getInstance(): MatchPrecomputeWorker {
    if (!MatchPrecomputeWorker._instance)
      throw new Error("MatchPrecomputeWorker not initialised");
    return MatchPrecomputeWorker._instance;
  }

  public readonly queue: Queue<IProfile>;

  private readonly worker: Worker<IProfile>;
  private readonly engine = new MatchingEngine();

  private constructor(
    private readonly redis: Redis,
    private readonly topK: number,
    concurrency: number
  ) {
    this.queue = new Queue<IProfile>("match-precompute", { connection: redis });

    this.worker = new Worker<IProfile>(
      "match-precompute",
      this.processJob.bind(this),
      { connection: redis, concurrency }
    );
  }

  public async close(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }

  private async processJob(job: { data: IProfile }): Promise<void> {
    const profile = job.data;
    const quad = QuadrantUtils.encode(profile.location.coordinates);
    const quads = QuadrantUtils.neighbours(quad);

    quads.push(quad);
    await this.redis.sadd(indexKey(quad), profile.id);

    const idSet = new Set<string>();

    for (const q of quads) {
      const ids = await this.redis.smembers(indexKey(q));
      ids.forEach((id) => idSet.add(id));
    }

    idSet.delete(profile.id);

    const candidates = await ProfileModel.find({
      id: { $in: [...idSet] },
    });
    /* score + upsert both ways */

    for (const candidate of candidates) {
      const score = this.engine.compositeScore(profile, candidate);

      if (score === 0) continue;

      await Promise.all([
        this.upsert(quad, profile.id, candidate.id, score),
        this.upsert(
          QuadrantUtils.encode(candidate.location.coordinates),
          candidate.id,
          profile.id,
          score
        ),
      ]);
    }
    await this.redis.sadd(indexKey(quad), profile.id);
  }

  private async upsert(
    quad: string,
    owner: string,
    match: string,
    score: number
  ) {
    const key = zsetKey(quad, owner);
    await this.redis.zadd(key, score.toString(), match);
    await this.redis.zremrangebyrank(key, 0, -(this.topK + 1));
  }
}
