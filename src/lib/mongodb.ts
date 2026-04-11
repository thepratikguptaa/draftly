import mongoose from "mongoose";

export async function connectDB() {
  // If already connected, reuse
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", resolve);
    });
    if ((mongoose.connection.readyState as number) === 1) return mongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  // Disconnect if in a bad state
  if (mongoose.connection.readyState === 3) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    dbName: "draftly",
    serverSelectionTimeoutMS: 10000,
    family: 4, // Force IPv4 - fixes DNS issues on some systems
  });

  return mongoose;
}
