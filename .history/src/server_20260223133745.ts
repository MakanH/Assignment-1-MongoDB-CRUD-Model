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
  response.write(`\nAdded reflection for date: ${firstRef.date}`);

  //Get single reflection
  response.write("\nGET SINGLE REFLECTION");
  const gottenRef = await model.getSingleReflection("2026-01-30");
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
  const updatedRef = await model.updateSingleReflection(
    "2020-10-10",
    "This is the updated version",
    1,
    30,
  );
  response.write(
    `Reflection on date ${updatedRef.date} has been changed to ${updatedRef.newReflectionText}`,
  );

  response.end("");
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
