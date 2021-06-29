import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"
import process from "process"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import User from "./entity/User"
import { authChecker } from "./modules/user/authChecker"
import { LoginResolver } from "./modules/user/Login"
import { RegisterResolver } from "./modules/user/Register"
import { AuthorizationResolver } from "./modules/user/Authorization"

const port = process.env.PORT || 4000

const main = async () => {
  const schema = await buildSchema({
    resolvers: [LoginResolver, RegisterResolver, AuthorizationResolver],
    authChecker,
  })

  const orm = await MikroORM.init({
    entities: [User],
    dbName: "hermes",
    type: "mongo",
    clientUrl: process.env.DB,
  })

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({
      req,
      res,
      em: orm.em.fork(),
    }),
  })

  const app = express()

  app.disable("x-powered-by")

  app.use(cors())
  apolloServer.applyMiddleware({ app, path: "/api" })

  app.listen(port, () => {
    const { PROTOCOL, DOMAIN } = process.env
    console.log(`Server up on ${PROTOCOL}${DOMAIN}:${port}/api`)
  })
}

main()
