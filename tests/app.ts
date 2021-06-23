import express, { RequestHandler } from 'express'
import { Server } from 'http'
import simpleRestProvider from './simpleRestProvider'

let portOffset = 0

export const setupApp = async (
  requestHandler: RequestHandler,
  ctx: { server: Server | null }
) => {
  const port = 6767 + portOffset
  portOffset += 1

  const app = express()

  app.use((req, res, next) => {
    // console.log(req.originalUrl)
    next()
  })

  app.use(requestHandler)

  app.use((err, req, res, next) => {
    console.error(err)
    next(err)
  })

  ctx.server = await new Promise<Server>(resolve => {
    const _server = app.listen(port, () => resolve(_server))
  })

  return simpleRestProvider(`http://localhost:${port}`) as {
    getList: (
      resource: any,
      params: any
    ) => Promise<{ data: any; total: number }>
    getOne: (resource: any, params: any) => Promise<{ data: any }>
    delete: (resource: any, params: any) => Promise<{ data: any }>
    update: (resource: any, params: any) => Promise<{ data: any }>
    create: (resource: any, params: any) => Promise<{ data: any }>
  }
}
