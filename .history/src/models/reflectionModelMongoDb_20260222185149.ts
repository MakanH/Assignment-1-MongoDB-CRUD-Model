import { setServers } from "node:dns";
import { MongoError, Db, MongoClient, Collection } from "mongodb";
import type { Document } from "mongodb";
import { isValid } from "./validateUtils.js";
import { InvalidInputError } from "./InvalidInputError.js";
import { DatabaseError } from "./DatabaseError.js";

let client: MongoClient;
let reflectionsCollection: Collection<Reflection> | undefined;

setServers(["8.8.8.8", "1.1.1.1"]);
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

interface Reflection {
  reflectionText: string;
  moodScore: number;
  date: string;
  timeSpentMins: number;
}

async function addReflection(
  reflectionText: string,
  moodScore: number,
  date: string,
  timeSpentMins: number,
): Promise<Reflection> {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  if (!isValid(reflectionText, moodScore, date, timeSpentMins))
    throw new InvalidInputError("A/many fields have an invalid input");
  try {
    const newReflection: Reflection = {
      reflectionText: reflectionText,
      moodScore: moodScore,
      date: date,
      timeSpentMins: timeSpentMins,
    };
    await reflectionsCollection.insertOne(newReflection);
    return newReflection;
  } catch (err: unknown) {
    if (err instanceof MongoError) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else if (err instanceof Error) {
      const msg = "Unexpected error occurred in addReflection: " + err.message;
      console.log(msg);
      throw new DatabaseError(msg);
    } else {
      const msg = "Unknown issue caught in addReflection. Should not happen.";
      console.error(msg);
      throw new DatabaseError(msg);
    }
  }
}

async function getSingleReflection(date: string) {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  try {
    const foundReflection = await reflectionsCollection.findOne({ date: date });
    if (foundReflection) return foundReflection;
    else throw new InvalidInputError(`No reflection found on date ${date}`);
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      throw err; // rethrow
    } else if (err instanceof Error) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else {
      throw new DatabaseError(
        "An unknown error occurred in getSinglePokemon. Should never happen.",
      );
    }
  }
}

export { initialize, addReflection, getSingleReflection };
export type { Reflection };
