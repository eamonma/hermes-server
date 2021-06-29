import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator"

export function IsDomain(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDomain",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]

          const domain = value.split("@")[1]
          return domain === relatedPropertyName
        },
      },
    })
  }
}
