import { MongoError, Db, MongoClient, Collection } from "mongodb";
import type { Document } from "mongodb";
import { isValid } from "./validateUtils.js";

const dbName: string = "reflection_db";
