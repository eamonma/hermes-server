import {
  Entity,
  ManyToOne,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core"
import { Field, ID, ObjectType, Root } from "type-graphql"
import { Base } from "./Base"
import Project from "./Project"
/*
 * File key format:
 * project.client/project.name/file.name
 */
@ObjectType()
@Entity()
export default class File extends Base<File> {
  @Field(type => ID)
  @SerializedPrimaryKey()
  id!: string

  @Field()
  @Property()
  name: string

  @Field()
  @Property()
  mime: string

  @Field()
  @Property()
  size: number

  @Field(type => String, { nullable: true })
  @Property()
  key: string

  // @Field(type => Project)
  // @ManyToOne(type => Project, { wrappedReference: true })
  // project: IdentifiedReference<Project>

  // constructor(project: Project, ...args: any[]) {
  //   super(...args)
  //   project = Reference.create(project)
  // }

  @Field()
  url(): string {
    const { AWS_BUCKET, AWS_ENDPOINT } = process.env
    return `https://${AWS_BUCKET}.${AWS_ENDPOINT}/${this.key}`
  }

  @Field(type => Project)
  @ManyToOne(type => Project)
  project: Project
}
