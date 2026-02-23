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
    // Check to see if the reflections collection exists
    let collectionCursor = db.listCollections({ name: "reflections" });
    let collectionArray = await collectionCursor.toArray();
    if (collectionArray.length == 0) {
      // collation specifying case-insensitive collection
      const collation = { locale: "en", strength: 1 };
      // No match was found, so create new collection
      await db.createCollection("reflections", { collation: collation });
    }
    reflectionsCollection = db.collection<Reflection>("reflections"); // convenient access to collection
  } catch (err) {
    if (err instanceof MongoError) {
      console.error("MongoDB connection failed:", err.message);
    } else {
      throw new DatabaseError("Initialization failed: " + err);
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
  const existingReflection = await reflectionsCollection.findOne({
    date: date,
  });
  if (existingReflection) {
    throw new InvalidInputError(
      `A reflection already exists for the date: ${date}`,
    );
  }
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

async function getSingleReflection(date: string): Promise<Reflection> {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  try {
    const foundReflection = await reflectionsCollection.findOne({ date: date });
    if (foundReflection) return foundReflection;
    else throw new InvalidInputError(`No reflection found on date ${date}`);
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      throw err;
    } else if (err instanceof Error) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else {
      throw new DatabaseError(
        "An unknown error occurred in getSingleReflection. Should never happen.",
      );
    }
  }
}

async function getAllReflections(): Promise<Reflection[]> {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  try {
    const cursor = await reflectionsCollection.find<Reflection>({});
    return cursor.toArray();
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      throw err;
    } else if (err instanceof Error) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else {
      throw new DatabaseError(
        "An unknown error occurred in getAllReflections. Should never happen.",
      );
    }
  }
}

async function updateSingleReflection(
  newdate: string,
  newReflectionText: string,
  newMoodScore: number,
  newTimeSpentMins: number,
) {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  const foundReflexion = await reflectionsCollection.findOne({
    date: newdate,
  });

  if (!foundReflexion) {
    throw new DatabaseError(`No reflection found for the date ${newdate}`);
  }

  if (!isValid(newReflectionText, newMoodScore, newdate, newTimeSpentMins)) {
    throw new InvalidInputError("A/many fields have an invalid input");
  }

  try {
    const result = await reflectionsCollection.updateOne(
      { date: newdate },
      {
        $set: {
          date: newdate,
          reflectionText: newReflectionText,
          moodScore: newMoodScore,
          timeSpentMins: newTimeSpentMins,
        },
      },
    );
    console.log("Updated reflection with new date " + newdate);
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      throw err;
    } else if (err instanceof Error) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else {
      throw new DatabaseError(
        "An unknown error occurred in updateSingleReflection. Should never happen.",
      );
    }
  }
}

async function deleteReflection(date: string) {
  if (reflectionsCollection == null)
    throw new DatabaseError("reflectionsCollection is undefined");
  const foundReflexion = await reflectionsCollection.findOne({
    date: date,
  });

  if (!foundReflexion) {
    throw new DatabaseError(`No reflection found for the date ${date}`);
  }

  try {
    const result = await reflectionsCollection.deleteOne({ date: date });
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      throw err;
    } else if (err instanceof Error) {
      console.log(err.message);
      throw new DatabaseError(err.message);
    } else {
      throw new DatabaseError(
        "An unknown error occurred in deleteReflection. Should never happen.",
      );
    }
  }
}
export {
  initialize,
  addReflection,
  getSingleReflection,
  getAllReflections,
  updateSingleReflection,
  deleteReflection,
};
export type { Reflection };
