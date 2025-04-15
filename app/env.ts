// This file is used to validate environment variables
export const EnvVars = {
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
}

// Validate required environment variables in development
if (process.env.NODE_ENV === "development") {
  const missingVars = Object.entries(EnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing environment variables: ${missingVars.join(", ")}\n` +
        `Create a .env.local file with the required variables.`,
    )
  }
}
