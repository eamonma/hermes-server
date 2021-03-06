import {
  Arg,
  Authorized,
  Ctx,
  Info,
  Mutation,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import Project from "../../entities/Project"
import File from "../../entities/File"
import { createProjectPassphrase } from "./createProjectPassphrase"
import { wrap } from "@mikro-orm/core"
import { GraphQLResolveInfo } from "graphql"
import fieldsToRelations from "graphql-fields-to-relations"

@Resolver(type => Project)
export class ProjectResolver {
  // getProject
  @Query(type => Project, { nullable: true })
  @Authorized("clientRequesting")
  async getProject(
    @Arg("id", { nullable: true }) id: string,
    @Arg("shortId", { nullable: true }) shortId: string,
    @Arg("clientRequesting") clientRequesting: boolean,
    @Arg("passphrase", { nullable: true }) passphrase: string = "",
    @Ctx() ctx: ExpressContext
  ): Promise<Project | null> {
    let project: Project

    let identifier: string
    let identity: string

    console.log({ id, shortId })

    if (!id && !shortId) return null

    if (id) {
      identifier = "id"
      identity = id
    } else {
      identifier = "shortId"
      identity = shortId
    }

    // If client requesting, passphrase should be present, so find project with passphrase
    if (clientRequesting)
      project = (await ctx.em.findOne(Project, {
        [identifier]: identity,
        passphrase,
      })) as Project
    // If admin requesting, passphrase is not present, but auth'd so ok
    else
      project = (await ctx.em.findOne(Project, {
        [identifier]: identity,
      })) as Project

    await project.files.init()

    return project
  }

  // createProject
  @Mutation(type => Project)
  @Authorized()
  async createProject(
    @Arg("name") name: string,
    @Arg("client") client: string,
    @Ctx() ctx: ExpressContext
  ): Promise<Project> {
    const project = new Project({
      name,
      client,
      passphrase: createProjectPassphrase(),
    })

    // console.log(ctx.res.locals.user)

    wrap(project).assign({ owner: ctx.res.locals.user }, { em: ctx.em })

    await ctx.em.persist(project).flush()

    return project
  }

  // addFileToProject
  @Mutation(type => Project, { nullable: true })
  @Authorized()
  async addFileToProject(
    @Arg("fileId") fileId: string,
    @Arg("projectId") projectId: string,
    @Ctx() ctx: ExpressContext,
    @Info() info: GraphQLResolveInfo
  ): Promise<Project | null> {
    const project = (await ctx.em.findOne(Project, {
      id: projectId,
    })) as Project
    // const file = (await ctx.em.findOne(File, { id: fileId }, fieldsToRelations)) as File
    const file = (await ctx.em.findOne(
      File,
      { id: fileId },
      fieldsToRelations(info, { root: "project" })
    )) as File

    // // Add file to project
    // wrap(project).assign({ files: [...project.files, file] })
    // // Set project to file
    // wrap(file).assign({
    //   project,
    // })

    // Populate files field on project
    await project.files.init()
    project.files.add(file)

    await ctx.em.persist(project).flush()
    await ctx.em.persist(file).flush()

    return project
  }
}
