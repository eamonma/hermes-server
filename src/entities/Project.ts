import {
  Entity,
  OneToMany,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core"
import { Field, ID, ObjectType } from "type-graphql"
import { Base } from "./Base"
import File from "./File"

@ObjectType()
@Entity()
export default class Project extends Base<Project> {
  @Field(type => ID)
  @SerializedPrimaryKey()
  id!: string

  @Field()
  @Property()
  name: string

  @Field()
  @Property()
  @OneToMany(type => File, (file: File) => file.project)
  files: File[]
}
