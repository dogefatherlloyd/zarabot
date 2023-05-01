export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance."

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || "https://api.openai.com"

export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1"
)

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || "openai"

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || "2023-03-15-preview"

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || ""

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || ""