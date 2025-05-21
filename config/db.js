// c:/Users/great/OneDrive/Desktop/sb-remote/config/db.ts

import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: 'C:/Users/great/OneDrive/Desktop/sb-remote/.env' }); // optional explicit path


const mongoUri= process.env.MONGODB_URI;

export const connectToDatabase = async () => {
  let db= null;

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
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
};
