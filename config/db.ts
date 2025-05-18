// c:/Users/great/OneDrive/Desktop/sb-remote/config/db.ts

import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoUri: string = process.env.MONGODB_URI as string;

export const connectToDatabase = async (): Promise<Db> => {
  let db: Db | null = null;

  if (db) {
    console.error("Database already connected!");
    return db;
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db("ContractInfo");
    console.error("Connected to MongoDB Atlas!");
    return db;
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
};
