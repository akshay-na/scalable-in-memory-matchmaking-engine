import { UUID } from "@akshay-na/exoframe/lib/common/UUID";
import request from "supertest";

describe("POST /api/v1/profile", () => {
  it("should create profile", async () => {
    const userId = UUID.randomUUID();
    const res = await request(app)
      .post("/api/v1/profile")
      .send({
        id: userId,
        age: 28,
        gender: "M",
        location: { lat: 13.7563, lon: 100.5018 },
        interests: ["music", "art", "travel", "cricket", "gaming"],
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });

  it("should respond with error when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/profile")
      .send({
        age: "user123", // Missing age, gender, location, and interests
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(400); // Assuming these fields are required
    expect(res.body.error.error).toBe("VALIDATION_FAILED");
  });
});

describe("PUT /api/v1/profile?seed=value", () => {
  it("should create profile", async () => {
    const seed = Math.floor(Math.random() * 1000) + 1;
    const res = await request(app)
      .put(`/api/v1/profile?seed=${seed.toString()}`)
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(seed);
  });

  it("should respond with error when seed number is higher than limit", async () => {
    const res = await request(app)
      .put(`/api/v1/profile?seed=100005`)
      .set("Accept", "application/json");
    expect(res.status).toBe(400); // Assuming these fields are required
    expect(res.body.error.error).toBe("VALIDATION_FAILED");
  });
});
