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

  @Property()
  passphrase: string

  @Field(type => [File])
  @OneToMany(type => File, (file: File) => file.project)
  files: File[]
}
