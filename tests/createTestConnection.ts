import { MikroORM } from "@mikro-orm/core"
import User from "../src/entities/User"

export const createTestConnection = async () =>
  await MikroORM.init({
    entities: ["dist/src/entities/"],
    entitiesTs: ["src/entities"],
    dbName: "hermes-test",
    type: "mongo",
    clientUrl: process.env.DB,
    tsNode: process.env.NODE_ENV !== "production",
  })
