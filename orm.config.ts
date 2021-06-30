import { MikroORM } from "@mikro-orm/core"

export default {
  entities: ["dist/src/entities/"],
  entitiesTs: ["src/entities"],
  dbName: "hermes",
  type: "mongo",
  clientUrl: process.env.DB,
  tsNode: process.env.NODE_ENV !== "production",
} as Parameters<typeof MikroORM.init>[0]
