import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core"
import { decode, JwtPayload } from "jsonwebtoken"
import { MongoClient } from "mongodb"
import supertest, { SuperTest, Test } from "supertest"
import Application from "../src/application"

let request: SuperTest<Test>
let application: Application
let em: EntityManager<IDatabaseDriver<Connection>>

const clearDatabase = async (): Promise<void> => {
  const client = await MongoClient.connect(process.env.DB as string, {
    useUnifiedTopology: true,
  })
  const db = client.db("hermes-test")
  await db.dropDatabase()
  await client.close()
}

describe("User resolvers", () => {
  beforeAll(async () => {
    application = new Application()
    await application.connect({
      entities: ["dist/src/entities/"],
      entitiesTs: ["src/entities"],
      dbName: "hermes-test",
      type: "mongo",
      clientUrl: process.env.DB,
      ensureIndexes: true,
    })
    await application.init()

    em = application.orm.em.fork()

    request = supertest(application.app)
    await clearDatabase()
  })

  afterAll(async () => {
    application.server.close()

    // Not documented
    await em.getConnection().close()
  })

  it("should pass", () => {
    expect(true).toBe(true)
  })

  it("should get basic query", async () => {
    const res = await request
      .post("/api")
      .send({
        query: `query {
        datetime
      }`,
      })
      .expect(200)
    expect(typeof res.body.data.datetime).toBe("string")
    expect(new Date(res.body.data.datetime)).toBeInstanceOf(Date)
  })

  it("should register user", async () => {
    const res = await request
      .post("/api")
      .send({
        query: `mutation {
        register(name: "Eamon Ma", email: "eamon@starlide.com", password: "123abc") {
        id
        name
        email
        }
      }`,
      })
      .expect(200)

    const { register } = res.body.data

    expect(typeof register.id).toBe("string")
    expect(register.name).toBe("Eamon Ma")
    expect(register.email).toBe("eamon@starlide.com")
  })

  it("should fail to register user", async () => {
    const res = await request
      .post("/api")
      .send({
        query: `mutation {
        register(name: "Eamon Ma", password: "123abc") {
        id
        name
        email
        }
      }`,
      })
      .expect(400)

    expect(res.body.errors).toBeTruthy()
  })

  it("should log user in", async () => {
    await request.post("/api").send({
      query: `mutation {
        register(name: "Eamon Ma", email: "eamon2@starlide.com", password: "123abc") {
        id
        name
        email
        }
      }`,
    })
    const res = await request
      .post("/api")
      .send({
        query: `mutation {
        login(email: "eamon2@starlide.com", password: "123abc") {
          id
          name
          email
        }
      }`,
      })
      .expect(200)

    const { token, "refresh-token": refreshToken } = res.headers
    const { id: tokenId } = decode(token) as JwtPayload
    const { id: refreshTokenId } = decode(refreshToken) as JwtPayload

    const { login } = res.body.data

    expect(tokenId).toBe(login.id)
    expect(refreshTokenId).toBe(login.id)
    expect(login.name).toBe("Eamon Ma")
    expect(login.email).toBe("eamon2@starlide.com")
  })
})
