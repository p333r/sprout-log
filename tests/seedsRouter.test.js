import request from "supertest";
import router from "../routes/seeds";
import { test, expect } from "vitest";

test("test", () => {
  expect(1).toBe(1);
});

test("GET /seeds", async () => {
  const res = await request(router).get("/seeds");
  expect(res.statusCode).toBe(200);
});
