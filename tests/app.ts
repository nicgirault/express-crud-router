import express, { RequestHandler } from "express";
import simpleRestProvider from "ra-data-simple-rest";

export const setupApp = async (requestHandler: RequestHandler, port = 8765) => {
  const app = express();

  app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
  });

  app.use(requestHandler);

  app.use((err, req, res, next) => {
    console.error(err);
  });
  await new Promise(resolve => app.listen(port, resolve));

  return simpleRestProvider(`http://localhost:${port}`);
};
