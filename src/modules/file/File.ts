import { wrap } from "@mikro-orm/core"
import { GraphQLResolveInfo } from "graphql"
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Info,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import File from "../../entities/File"
import { FileInput } from "./FileInput"

@Resolver()
@ObjectType()
export class FileResolver {
  @Authorized()
  @Mutation(type => [String])
  async signUploadUrls(
    @Arg("size") size: number,
    @Ctx() { req, res, em }: ExpressContext
  ): Promise<string[]> {
    return [""]
  }

  @Authorized("client")
  @Query(type => File)
  async getFile(
    @Arg("id") id: string,
    @Arg("client") client: boolean,
    @Arg("passphrase", { nullable: true }) passphrase: string = "",
    @Ctx() ctx: ExpressContext
  ): Promise<File | null> {
    let file = (await ctx.em.findOne(File, { id })) as File
    await file.project.init()

    // If admin requesting
    if (!client) return file
    // If client requesting, and passphrase matches
    if (file.project.passphrase === passphrase) return file

    return null
  }

  @Authorized()
  @Mutation(type => File)
  async createFile(
    @Args() { name, mime, projectId }: FileInput,
    @Ctx() ctx: ExpressContext
  ): Promise<File> {
    const project = (await ctx.em.findOne(File, { id: projectId }, [
      "files",
    ])) as File

    const file = new File({ name, mime })
    wrap(file).assign({ project }, { em: ctx.em })

    await ctx.em.persist(file).flush()

    return file
  }
}
