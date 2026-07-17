import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

// Persistent in-memory fallback store
let globalWithStore = global as any;
if (!globalWithStore._mockJobs) {
  globalWithStore._mockJobs = [];
}

class MockCollection {
  async insertOne(doc: any) {
    const id = doc._id || new ObjectId();
    const newDoc = { _id: id, ...doc };
    globalWithStore._mockJobs.push(newDoc);
    return { insertedId: id };
  }

  async findOne(query: any) {
    const idStr = query._id?.toString();
    return globalWithStore._mockJobs.find((j: any) => j._id.toString() === idStr) || null;
  }

  async updateOne(query: any, update: any) {
    const idStr = query._id?.toString();
    const index = globalWithStore._mockJobs.findIndex((j: any) => j._id.toString() === idStr);
    if (index !== -1 && update.$set) {
      globalWithStore._mockJobs[index] = {
        ...globalWithStore._mockJobs[index],
        ...update.$set,
      };
    }
    return { modifiedCount: 1 };
  }

  find(query: any = {}) {
    let result = [...globalWithStore._mockJobs];
    return {
      sort(sortQuery: any) {
        if (sortQuery.createdAt === -1) {
          result.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return this;
      },
      skip(n: number) {
        result = result.slice(n);
        return this;
      },
      limit(n: number) {
        result = result.slice(0, n);
        return this;
      },
      async toArray() {
        return result;
      },
    };
  }

  async countDocuments(query: any = {}) {
    return globalWithStore._mockJobs.length;
  }
}

const mockDb = {
  collection(name: string) {
    return new MockCollection();
  },
};

let clientPromise: Promise<MongoClient> | null = null;
let useMock = false;

if (!uri || uri.includes("username:password") || uri.includes("your_mongodb_uri")) {
  console.warn("MongoDB URI is not configured or is placeholder. Using in-memory fallback database.");
  useMock = true;
} else {
  try {
    const client = new MongoClient(uri);
    if (process.env.NODE_ENV === "development") {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };
      if (!globalWithMongo._mongoClientPromise) {
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      clientPromise = client.connect();
    }
  } catch (err) {
    console.error("Failed to initialize MongoDB client. Falling back to in-memory store:", err);
    useMock = true;
  }
}

export async function connectToDatabase() {
  if (useMock) {
    return { client: null as any, db: mockDb as any };
  }

  try {
    const connection = await clientPromise!;
    const db = connection.db();
    return { client: connection, db };
  } catch (err) {
    console.warn("MongoDB connection failed at runtime. Falling back to in-memory database store. Error:", err);
    return { client: null as any, db: mockDb as any };
  }
}
export { ObjectId };
