import jwt from 'jwt-simple';
import moment from 'moment';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Secret key for JWT encoding
const secret = process.env.SECRET_KEY;

// Function to create JWT token
// Unix time: seconds since January 1, 1970
const createToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    iat: moment().unix(), // Issue date
    exp: moment().add(7, 'days').unix() // Expiration date (7 days from now)
  };

  // Return the encoded JWT token
  return jwt.encode(payload, secret);
};

export {
  secret,
  createToken
};
