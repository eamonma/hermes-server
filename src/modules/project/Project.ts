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
  @Authorized("client")
  async getProject(
    @Arg("id") id: string,
    @Arg("client") client: boolean,
    @Arg("passphrase", { nullable: true }) passphrase: string = "",
    @Ctx() ctx: ExpressContext
  ): Promise<Project | null> {
    let project: Project
    // If client requesting, passphrase should be present, so find project with passphrase
    if (client)
      project = (await ctx.em.findOne(Project, { id, passphrase })) as Project
    // If admin requesting, passphrase is not present, but auth'd so ok
    else project = (await ctx.em.findOne(Project, { id })) as Project

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
