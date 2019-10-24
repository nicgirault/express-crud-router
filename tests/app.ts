import express, { RequestHandler } from "express";
import simpleRestProvider from "ra-data-simple-rest";

let portOffset = 0;

export const setupApp = async (requestHandler: RequestHandler) => {
  const port = 6767 + portOffset;
  portOffset += 1;

  const app = express();

  app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
  });

  app.use(requestHandler);

  app.use((err, req, res, next) => {
    console.error(err);
    next(err);
  });
  await new Promise(resolve => app.listen(port, resolve));

  return simpleRestProvider(`http://localhost:${port}`);
};
