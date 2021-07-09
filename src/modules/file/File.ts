import { Type, wrap } from "@mikro-orm/core"
import { GraphQLResolveInfo } from "graphql"
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  Info,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import File from "../../entities/File"
import Project from "../../entities/Project"
import { FileInput } from "./FileInput"
import s3 from "./s3"

@InputType()
class Part {
  @Field()
  ETag: string

  @Field()
  PartNumber: number
}

@ObjectType()
class SignedUpload {
  @Field()
  UploadId: string

  @Field(type => [String])
  signedUrls: string[]
}

const Bucket = process.env.AWS_BUCKET as string

@Resolver()
@ObjectType()
export class FileResolver {
  // signUploadUrls
  @Authorized()
  @Mutation(type => SignedUpload)
  async signUploadUrls(
    @Arg("parts", type => Int) parts: number,
    @Arg("key") Key: string,
    @Ctx() { req, res, em }: ExpressContext
  ): Promise<SignedUpload> {
    // https://www.altostra.com/blog/multipart-uploads-with-s3-presigned-url

    let { UploadId } = await s3
      .createMultipartUpload({
        Bucket,
        Key,
      })
      .promise()

    UploadId = UploadId as string

    const promises = []

    for (let index = 0; index < parts; index++) {
      promises.push(
        s3.getSignedUrlPromise("uploadPart", {
          Bucket,
          Key,
          UploadId,
          PartNumber: index + 1,
        })
      )
    }

    const response = await Promise.all(promises)
    let signedUrls: string[] = []

    response.forEach((element, i) => {
      signedUrls[i] = element as string
    })

    return { UploadId, signedUrls }
  }

  // completeUpload
  @Authorized()
  @Mutation(type => Boolean)
  async completeUpload(
    @Arg("uploadId") uploadId: string,
    @Arg("parts", type => [Part])
    parts: Part[],
    @Arg("key") key: string
  ): Promise<boolean> {
    const res = await s3
      .completeMultipartUpload({
        Bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
      .promise()

    return true
  }

  @Authorized()
  @Mutation(type => Boolean)
  async abortUpload(
    @Arg("uploadId") uploadId: string,
    @Arg("key") key: string
  ): Promise<boolean> {
    const res = await s3
      .abortMultipartUpload({
        Bucket,
        Key: key,
        UploadId: uploadId,
      })
      .promise()

    return true
  }

  @Authorized("clientRequesting")
  @Query(type => File)
  async getFile(
    @Arg("id") id: string,
    @Arg("clientRequesting") clientRequesting: boolean,
    @Arg("passphrase", { nullable: true }) passphrase: string = "",
    @Ctx() ctx: ExpressContext
  ): Promise<File | null> {
    let file = (await ctx.em.findOne(File, { id })) as File
    await file.project.init()

    // If admin requesting
    if (!clientRequesting) return file
    // If client requesting, and passphrase matches
    if (file.project.passphrase === passphrase) return file

    return null
  }

  @Authorized("clientRequesting")
  @Mutation(type => String)
  async signFileUrl(
    @Arg("id") id: string,
    @Arg("clientRequesting") clientRequesting: boolean,
    @Arg("passphrase", { nullable: true }) passphrase: string = "",
    @Ctx() ctx: ExpressContext
  ): Promise<string | null> {
    let file = (await ctx.em.findOne(File, { id })) as File
    await file.project.init()

    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket,
      Key: file.key,
      Expires: 86400,
    })

    // If admin requesting
    if (!clientRequesting) return url
    // If client requesting, and passphrase matches
    if (file.project.passphrase === passphrase) return url

    return null
  }

  @Authorized()
  @Mutation(type => File)
  async createFile(
    @Args() { name, mime, projectId, size, key }: FileInput,
    @Ctx() ctx: ExpressContext
  ): Promise<File> {
    const project = (await ctx.em.findOne(Project, { id: projectId }, [
      "files",
    ])) as Project

    const file = new File({ name, mime, size, key })

    wrap(file).assign({ project }, { em: ctx.em })

    await ctx.em.persist(file).flush()

    return file
  }

  @Authorized()
  @Mutation(type => Boolean)
  async deleteFile(
    @Arg("id") id: string,
    @Ctx() ctx: ExpressContext
  ): Promise<boolean> {
    const file = await ctx.em.findOneOrFail(File, { id })

    await s3
      .deleteObject({
        Bucket,
        Key: file.key,
      })
      .promise()

    await ctx.em.remove(file).flush()

    return true
  }
}
