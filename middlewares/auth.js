import jwt from 'jwt-simple';
import moment from 'moment';
import { secret } from '../services/jwt.js'; // Importing secret key for JWT verification

// Authentication middleware to protect routes
export const ensureAuth = (req, res, next) => {
  // Check if the authorization header exists
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(403).json({
      status: "error",
      message: "Authorization header missing"
    });
  }

  // Extract and clean the token (remove unnecessary quotes and prefix 'Bearer')
  const token = authorizationHeader.replace(/['"]+/g, '').replace("Bearer ", "");

  try {
    // Decode the JWT token
    const payload = jwt.decode(token, secret);

    // Check if the token has expired
    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "Token has expired"
      });
    }

    // Attach the user information to the request object for further use
    req.user = payload;

  } catch (error) {
    // Catch any decoding or validation errors
    return res.status(400).json({
      status: "error",
      message: "Invalid token"
    });
  }

  // Proceed to the next middleware or route handler
  next();
};


