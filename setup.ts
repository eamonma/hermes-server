import prompts, { PromptObject } from "prompts"
import { randomBytes } from "crypto"
import { promises as fs, existsSync } from "fs"
const { writeFile } = fs
import chalk from "chalk"

const camelToUpperSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()
}

const envQuestions: PromptObject[] = [
  {
    type: "select",
    name: "nodeEnv",
    message: "Production or development environment?",
    choices: [
      {
        title: "development",
        value: "development",
      },
      {
        title: "production",
        value: "production",
      },
    ],
  },
  {
    type: "text",
    name: "protocol",
    message: "Protocol?",
    initial: "http://",
  },
  {
    type: "text",
    name: "domain",
    message: "Domain?",
    initial: "localhost",
  },
  {
    type: "password",
    name: "refreshSecret",
    message: "JWT refresh token secret key?",
    initial: randomBytes(128).toString("hex"),
  },
  {
    type: "password",
    name: "accessSecret",
    message: "JWT access token secret key?",
    initial: randomBytes(128).toString("hex"),
  },
  {
    type: "text",
    name: "db",
    message: "Database connection string?",
  },
  {
    type: "text",
    name: "oauthId",
    message: "Google OAuth ID?",
  },
  {
    type: "text",
    name: "oauthSecret",
    message: "Google OAuth secret?",
  },
]

const configQuestions: PromptObject[] = [
  {
    type: "toggle",
    name: "registration",
    message: "Enable registration?",
    initial: false,
    active: "yes",
    inactive: "no",
  },
  {
    type: "toggle",
    name: "guardRegistrationDomain",
    message: "Limit registration email to one domain?",
    initial: false,
    active: "yes",
    inactive: "no",
  },
  {
    type: prev => (prev ? "text" : null),
    name: "domain",
    message: "What domain?",
  },
]

;(async () => {
  const envExists = existsSync(".env")
  const configExists = existsSync("app.config.json")

  if (!envExists) {
    const envResponse = await prompts(envQuestions)
    let envFileString: string = ""
    for (const property in envResponse) {
      envFileString += `${camelToUpperSnakeCase(property)}="${
        envResponse[property]
      }"`
      envFileString += "\n"
    }

    await writeFile(".env", envFileString)
  } else {
    console.log(chalk.bold.red(".env already exists."))
  }

  if (!configExists) {
    const configResponse = await prompts(configQuestions)
    await writeFile("app.config.json", JSON.stringify(configResponse, null, 2))
  } else {
    console.log(chalk.bold.red("app.config.json already exists."))
  }
})()
