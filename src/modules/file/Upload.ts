import argon2 from "argon2"
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"

@Resolver()
@ObjectType()
export class UploadResolver {
  @Authorized()
  @Mutation(type => [String])
  async signUploadUrls(
    @Arg("size") size: number,
    @Ctx() { req, res, em }: ExpressContext
  ): Promise<string[]> {
    return [""]
  }

  // @Authorized()
  // @Mutation()
  // async createFile()
}
