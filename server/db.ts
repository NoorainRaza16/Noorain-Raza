import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Load environment variables from root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

// MongoDB connection
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    
    console.log("Connecting to MongoDB with URI:", mongoURI.substring(0, 30) + "...");
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed through app termination");
  process.exit(0);
});

export { connectDB };
export default mongoose;