import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core"
import supertest, { SuperTest, Test } from "supertest"
import Application from "../src/application"

let request: SuperTest<Test>
let application: Application
let em: EntityManager<IDatabaseDriver<Connection>>

describe("User resolvers", () => {
  beforeAll(async () => {
    application = new Application()
    await application.connect()
    await application.init()

    em = application.orm.em.fork()

    request = supertest(application.app)
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
})
