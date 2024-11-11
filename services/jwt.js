import jwt from 'jwt-simple';
import moment from 'moment';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate presence of secret key
const secret = process.env.SECRET_KEY;
if (!secret) {
  throw new Error("SECRET_KEY is not defined in the environment variables");
}

// Function to create JWT token
const createToken = (user) => {
  if (!user || !user._id || !user.role) {
    throw new Error("User data is incomplete for token generation");
  }

  const payload = {
    userId: user._id,
    role: user.role,
    iat: moment().unix(), // Issue date in Unix time
    exp: moment().add(7, 'days').unix() // Expiration date (7 days from now)
  };

  // Return the encoded JWT token
  return jwt.encode(payload, secret);
};

export {
  secret,
  createToken
};
