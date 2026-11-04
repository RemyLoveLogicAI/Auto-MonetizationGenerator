import type { Context } from 'hono'

export type CloudflareBindings = {
  R2?: R2Bucket
  ENVIRONMENT?: string
}

export type AppEnv = {
  Bindings: CloudflareBindings
}

export type AppContext = Context<AppEnv>
