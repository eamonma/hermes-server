import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"
import passport from "passport"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import User from "./entity/User"
import { LoginResolver } from "./modules/user/Login"
import { RegisterResolver } from "./modules/user/Register"

const port = process.env.PORT || 4000
const main = async () => {
  console.log(process.env.DB)

  // mongoose.connect(process.env!.DB)

  const schema = await buildSchema({
    resolvers: [LoginResolver, RegisterResolver],
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

  app.use(cors())
  app.use(passport.initialize())
  apolloServer.applyMiddleware({ app, path: "/api" })

  app.listen(port, () => {
    const { PROTOCOL, DOMAIN } = process.env
    console.log(`Server up on ${PROTOCOL}${DOMAIN}:${port}/api`)
  })
}

main()
