import { connect } from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Function to establish MongoDB connection
const connection = async () => {
  try {
    // Ensure MongoDB URI is available in environment variables
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in environment variables.");
    }

    // Connect to the MongoDB database
    await connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Successfully connected to DB_Social_Network");

  } catch (error) {
    // Log the error and throw a more descriptive message
    console.error("Error while connecting to the database:", error.message);
    throw new Error("Failed to connect to the database. Please check the connection details.");
  }
};

export default connection;
