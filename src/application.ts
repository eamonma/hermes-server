import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core"
import { MongoDriver } from "@mikro-orm/mongodb"
import { ApolloServer } from "apollo-server-express"
import chalk from "chalk"
import cors from "cors"
import express from "express"
import { Server } from "http"
import process from "process"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import ormConfig from "../orm.config"
import { ExpressContext } from "./contexts/ExpressContext"
import { FileResolver } from "./modules/file/File"
import { ProjectResolver } from "./modules/project/Project"
import { authChecker } from "./modules/user/authChecker"
import { AuthorizationResolver } from "./modules/user/Authorization"
import { LoginResolver } from "./modules/user/Login"
import { RegisterResolver } from "./modules/user/Register"

const port = process.env.PORT || 4000

export default class Application {
  orm: MikroORM<IDatabaseDriver<Connection>>
  app: express.Application
  server: Server

  async connect(config: any = ormConfig): Promise<void> {
    try {
      this.orm = await MikroORM.init<MongoDriver>(config)
    } catch (error) {
      console.error(chalk.red("📌 Could not connect to the database"), error)
      throw Error(error as string)
    }
  }

  async init(): Promise<void> {
    this.app = express()
    const schema = await buildSchema({
      resolvers: [
        LoginResolver,
        RegisterResolver,
        AuthorizationResolver,
        FileResolver,
        ProjectResolver,
      ],
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

    this.server = this.app.listen(port, () => {
      const { PROTOCOL, DOMAIN } = process.env
      console.log(`Server up on ${PROTOCOL}${DOMAIN}:${port}/api`)
    })
  }
}
