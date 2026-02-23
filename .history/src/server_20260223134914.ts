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
    "3rd reflection added",
    3,
    "2026-05-31",
    50,
  );
  response.write(`\nAdded reflection for date: ${firstRef.date}`);

  //Get single reflection
  response.write("\nGET SINGLE REFLECTION");
  const gottenRef = await model.getSingleReflection("2026-05-30");
  response.write(
    `\nReflection for ${gottenRef.date}: ${gottenRef.reflectionText}`,
  );

  //Get all reflections
  response.write("\nALL REFLECTIONS");
  const allRefs = await model.getAllReflections();
  for (const reflection of allRefs) {
    response.write("\n" + reflection.reflectionText);
    response.write("\n");
  }

  //Update single reflection
  response.write("\nUPDATE SINGLE REFLECTION");
  await model.updateSingleReflection(
    "2026-05-30",
    "This is the updated version",
    1,
    30,
  );
  const updatedRef = await model.getSingleReflection("2026-05-30");
  response.write(
    `Reflection on date ${updatedRef.date} has been changed to ${updatedRef.reflectionText}`,
  );

  response.end("");
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
