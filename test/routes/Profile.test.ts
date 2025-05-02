import request from "supertest";

describe("POST /api/v1/profile", () => {
  it("should create profile", async () => {
    const res = await request(app)
      .post("/api/v1/profile")
      .send({
        id: "user123",
        age: 28,
        gender: "M",
        location: { lat: 13.7563, lon: 100.5018 },
        interests: ["music", "art", "travel"],
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("user123");
  });

  it("should respond with error when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/hello")
      .send({
        id: "user123", // Missing age, gender, location, and interests
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(400); // Assuming these fields are required
    expect(res.body.error.error).toBe("VALIDATION_FAILED");
  });
});
