import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"
import process from "process"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import ormConfig from "../orm.config"
import { ExpressContext } from "./contexts/ExpressContext"
import { authChecker } from "./modules/user/authChecker"
import { AuthorizationResolver } from "./modules/user/Authorization"
import { LoginResolver } from "./modules/user/Login"
import { RegisterResolver } from "./modules/user/Register"

const port = process.env.PORT || 4000

export default class Application {
  orm: MikroORM<IDatabaseDriver<Connection>>
  app: express.Application

  async connect(): Promise<void> {
    try {
      this.orm = await MikroORM.init(ormConfig)
    } catch (error) {
      console.error("📌 Could not connect to the database", error)
      throw Error(error as string)
    }
  }

  async init(): Promise<void> {
    this.app = express()
    const schema = await buildSchema({
      resolvers: [LoginResolver, RegisterResolver, AuthorizationResolver],
      authChecker,
    })

    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }: any) =>
        ({
          req,
          res,
          em: this.orm.em.fork(),
        } as ExpressContext),
    })

    this.app.disable("x-powered-by")
    this.app.set("Access-Control-Expose-Headers", ["Token", "Refresh-Token"])
    this.app.use(cors())

    apolloServer.applyMiddleware({ app: this.app, path: "/api" })

    this.app.listen(port, () => {
      const { PROTOCOL, DOMAIN } = process.env
      console.log(`Server up on ${PROTOCOL}${DOMAIN}:${port}/api`)
    })
  }
}
