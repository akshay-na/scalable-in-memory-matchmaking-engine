import { IProfile } from "../models/ProfileModel";

export class MatchingEngine {
  private readonly INTEREST_WEIGHT = 0.65;
  private readonly AGE_WEIGHT = 0.2;
  private readonly DIST_WEIGHT = 0.15;

  private readonly MAX_AGE_GAP_YEARS = 10;
  private readonly MAX_RADIUS_KM = 50;

  private static readonly EARTH_RADIUS_KM = 6_371;

  constructor() {}

  protected calculateDistance(
    [lon1, lat1]: [number, number],
    [lon2, lat2]: [number, number]
  ): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * MatchingEngine.EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  }

  private haversineScorer(
    coordinate1: [number, number],
    coordinate2: [number, number]
  ): number {
    function swapLonLat([lon, lat]: [number, number]): [number, number] {
      return [lat, lon];
    }

    const km = this.calculateDistance(
      swapLonLat(coordinate1),
      swapLonLat(coordinate2)
    );

    const normalized = 1 - Math.min(km / this.MAX_RADIUS_KM, 1);
    return normalized;
  }

  private ageScore(age1: number, age2: number): number {
    const gap = Math.abs(age1 - age2);
    return 1 - Math.min(gap / this.MAX_AGE_GAP_YEARS, 1);
  }

  private interestScore(a: string[], b: string[]): number {
    if (!a.length && !b.length) return 0;
    const A = new Set(a),
      B = new Set(b);
    const intersection = [...A].filter((x) => B.has(x)).length;
    const union = new Set([...A, ...B]).size;
    return intersection / union;
  }

  private compositeScore(a: IProfile, b: IProfile): number {
    const wSum = this.INTEREST_WEIGHT + this.AGE_WEIGHT + this.DIST_WEIGHT;

    const score =
      this.INTEREST_WEIGHT * this.interestScore(a.interests, b.interests) +
      this.AGE_WEIGHT * this.ageScore(a.age, b.age) +
      this.DIST_WEIGHT *
        this.haversineScorer(a.location.coordinates, b.location.coordinates);

    return score / wSum;
  }

  public topMatches(
    seed: IProfile,
    candidates: IProfile[],
    limit = 5
  ): IProfile[] {
    if (limit <= 0) return [];

    type Scored = { p: IProfile; score: number };
    const heap: Scored[] = [];

    const push = (entry: Scored): void => {
      heap.push(entry);
      heap.sort((a, b) => a.score - b.score);
      if (heap.length > limit) heap.shift();
    };

    for (const p of candidates) {
      if (p.id === seed.id) continue;
      const score = this.compositeScore(seed, p);
      if (score > 0) push({ p, score });
    }

    return heap
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.p);
  }
}
