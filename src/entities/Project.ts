import {
  Collection,
  Entity,
  OneToMany,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core"
import { Authorized, Field, ID, ObjectType } from "type-graphql"
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
  client: string

  @Field()
  @Authorized()
  @Property()
  passphrase: string

  @Field(type => [File], { nullable: true })
  @OneToMany(type => File, (file: File) => file.project)
  files = new Collection<File>(this)
}
