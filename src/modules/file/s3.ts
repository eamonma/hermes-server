import AWS from "aws-sdk"
import S3 from "aws-sdk/clients/s3"

const endpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT as string)

// AWS auth is configured with environment variables: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-set
export default new S3({ endpoint, signatureVersion: "v4" })
