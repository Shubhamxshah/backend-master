import {describe, expect, test, it} from 'vitest';
import request from "supertest";
import { app } from '..';

describe("GET /health", () => {
  it ("should do ", async () => {
    const res = await request(app).get("/health")

    expect(res.body.message).toBe("hey shubham")
  })
})
