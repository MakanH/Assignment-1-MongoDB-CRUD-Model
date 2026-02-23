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
  //Add reflection
  response.write("ADD REFLECTION");
  const firstRef = await model.addReflection(
    "Its a beautiful day!",
    3,
    "2026-01-30",
    50,
  );
  response.write(`Added reflection for date: ${firstRef.date}`);

  //Get single reflection
  response.write("\nGET SINGLE REFLECTION");
  const gottenRef = await model.getSingleReflection("2026-01-30");
  response.write(
    `Reflection for ${gottenRef.date}: ${gottenRef.reflectionText}`,
  );
  response.end("");
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
