import { Request } from "express"
import { PassportContext } from "graphql-passport"
import User from "../entity/User"

export interface ExpressContext extends PassportContext<User, Request> {}
