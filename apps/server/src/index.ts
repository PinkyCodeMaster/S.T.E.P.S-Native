import { Scalar } from '@scalar/hono-api-reference'
import { pinoLogger } from './middleware/logger'
import { OpenAPIHono } from '@hono/zod-openapi'
import { prettyJSON } from 'hono/pretty-json'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import env from './env'

const app = new OpenAPIHono().basePath('/api/v1')

app.use('*', prettyJSON({ force: true, space: 2 }))
app.use('*', pinoLogger())
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
// Middleware that reads allowed origins from env
app.use('*', async (c, next) => {
  const allowedOrigins = env.CORS_ORIGINS!.split(',').map(o => o.trim())

  const corsMiddlewareHandler = cors({
    origin: (origin) => {
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })

  return corsMiddlewareHandler(c, next)
})

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))


app.doc('/docs', {
  openapi: '3.0.0',
  info: {
    version: '0.1.0',
    title: 'S.T.E.P.S API Documentation',
  },
})

app.get('/scalar', Scalar({
  url: '/docs',
  title: 'S.T.E.P.S API Reference',
  theme: "bluePlanet",
  layout: "modern",
  expandAllModelSections: true,
  expandAllResponses: true,
  hideClientButton: true,
  showSidebar: true,
  showDeveloperTools: "localhost",
  operationTitleSource: "summary",
  persistAuth: false,
  telemetry: true,
  isEditable: false,
  isLoading: false,
  hideModels: false,
  documentDownloadType: "both",
  hideTestRequestButton: false,
  hideSearch: false,
  showOperationId: false,
  hideDarkModeToggle: false,
  withDefaultFonts: true,
  defaultOpenAllTags: false,
  orderSchemaPropertiesBy: "alpha",
  orderRequiredPropertiesFirst: true,
  _integration: "hono",
  default: false,
  slug: "my-api"
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port: 9000,
  fetch: app.fetch,
} 
