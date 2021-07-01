import Mailgen from "mailgen"
import "dotenv/config"

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    // Appears in header & footer of e-mails
    name: "Starlide",
    link: "https://starlide.com",
    // Optional product logo
    // logo: 'https://mailgen.js/img/logo.png'
  },
})

const email = {
  body: {
    signature: false,
    name: "Eamon Ma",
    intro: "Welcome to Mailgen! We're very excited to have you on board.",
    action: {
      instructions: "To get started with Mailgen, please click here:",
      button: {
        color: "#ae0f2c", // Optional action button color
        text: "Confirm your email",
        link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
      },
    },
    outro:
      "Need help, or have questions? Just reply to this email, we'd love to help.",
  },
} as any

console.log(mailGenerator.generatePlaintext(email))

// import sgMail from "@sendgrid/mail"
// sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
// console.log(process.env.SENDGRID_API_KEY as string)

// const msg = {
//   to: "m@eamonma.com", // Change to your recipient
//   from: "sales@starlide.com", // Change to your verified sender
//   subject: "Sending with SendGrid is Fun",
//   html: mailGenerator.generate(email),
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log("Email sent")
//   })
//   .catch(error => {
//     console.error(error)
//   })
