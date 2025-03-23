import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";
import User from "../models/userSchema.js";
import { redisClient } from "../config/redisDb.js";

const { expect } = chai;
chai.use(chaiHttp);

let testUser = {
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "johndoe@example.com",
  password: "Password123",
  address: "123 Test St",
};

let authToken;

describe("Auth API Tests", () => {
  before(async () => {
    await User.deleteMany({}); 
    await redisClient.flushAll();
  });

  describe("Register User", () => {
    it("should register a user successfully", (done) => {
      chai
        .request(app)
        .post("/api/v1/register")
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("success", true);
          expect(res.body.data).to.include({
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            username: testUser.username,
            email: testUser.email,
          });
          done();
        });
    });

    it("should not register a user with existing email or username", (done) => {
      chai
        .request(app)
        .post("/api/v1/register")
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success", false);
          done();
        });
    });
  });

  describe("Login User", () => {
    it("should login a user successfully", (done) => {
      chai
        .request(app)
        .post("/api/v1/login")
        .send({ usernameOrEmail: testUser.email, password: testUser.password })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("access_token");
          authToken = res.body.access_token;
          done();
        });
    });

    it("should not login with incorrect password", (done) => {
      chai
        .request(app)
        .post("/api/v1/login")
        .send({ usernameOrEmail: testUser.email, password: "wrongpass" })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe("Logout User", () => {
    it("should logout successfully", (done) => {
      chai
        .request(app)
        .post("/api/v1/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("should return error for invalid token", (done) => {
      chai
        .request(app)
        .post("/api/v1/logout")
        .set("Authorization", "Bearer invalidtoken")
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
  });
});