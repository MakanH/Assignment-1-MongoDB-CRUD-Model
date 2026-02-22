import { MongoError, Db, MongoClient, Collection } from "mongodb";
import type { Document } from "mongodb";
import { isValid } from "./validateUtils.js";

let client: MongoClient;
let reflectionsCollection: Collection<Document> | undefined;

const dbName: string = "reflection_db";

/**
 * Connect up to the online MongoDb database with the name stored in dbName
 */
async function initialize(): Promise<void> {
  try {
    const url = `${process.env.URL_PRE}${process.env.MONGODB_PWD}${process.env.URL_POST}`;
    client = new MongoClient(url); // store connected client for use while the app is running
    await client.connect();
    console.log("Connected to MongoDb");
    const db: Db = client.db(dbName);
    reflectionsCollection = db.collection("reflections"); // convenient access to collection
  } catch (err) {
    if (err instanceof MongoError) {
      console.error("MongoDB connection failed:", err.message);
    } else {
      console.error("Unexpected error:", err);
    }
  }
}

export { initialize };
