import { BaseEntity, PrimaryKey, Property } from "@mikro-orm/core"
import { ObjectId } from "mongodb"
import { Field, ID, ObjectType } from "type-graphql"

@ObjectType({ isAbstract: true })
export class Base<T extends { id: string }> extends BaseEntity<T, "id"> {
  @Field(type => ID)
  @PrimaryKey()
  _id: ObjectId

  @Field()
  @Property()
  createdAt: Date = new Date()

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  constructor(body = {}) {
    super()
    this.assign(body)
  }
}
