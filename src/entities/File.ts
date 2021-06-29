import {
  Entity,
  ManyToOne,
  Property,
  SerializedPrimaryKey,
  IdentifiedReference,
  Reference,
} from "@mikro-orm/core"
import { Field, ID, ObjectType } from "type-graphql"
import { Base } from "./Base"
import Project from "./Project"

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
  url: string

  @Field()
  @Property()
  @ManyToOne(type => Project, { wrappedReference: true })
  project: IdentifiedReference<Project>

  constructor(project: Project, ...args: any[]) {
    super(...args)
    project = Reference.create(project)
  }
}
