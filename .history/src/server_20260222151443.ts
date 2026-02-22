import { createServer, IncomingMessage, ServerResponse } from "http";
const port: number = 1339;
import * as model from "./models/reflectionModelMongoDb.js";
let initialized = model.initialize();

createServer(async function (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  await initialized;
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Hello World <yourname>");
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
