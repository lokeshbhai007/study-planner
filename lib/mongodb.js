// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local or in Vercel settings');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Reuse global connection in development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then((client) => {
      console.log('✅ MongoDB connected (dev)');
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Create new connection in production (Vercel serverless)
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then((client) => {
    console.log('✅ MongoDB connected (prod)');
    return client;
  });
}

export default clientPromise;
