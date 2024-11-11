// Import dependencies (ensure they are configured in package.json)
import express from "express";
import connection from "./database/connection.js";
import cors from "cors";
import bodyParser from "body-parser";
import UserRoutes from "./routes/users.js";
import PublicationRoutes from "./routes/publications.js";
import FollowRoutes from "./routes/follows.js";

// Log a welcome message to confirm the API is running
console.log("Node API is running");

// Establish database connection
connection();

// Initialize Express server
const app = express();
const port = process.env.PORT || 3900;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware to parse incoming request data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure application routes (modules)
app.use('/api/user', UserRoutes);
app.use('/api/publication', PublicationRoutes);
app.use('/api/follow', FollowRoutes);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Node server running on port ${port}`);
});

export default app;
