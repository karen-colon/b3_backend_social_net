import { Router } from "express";
import { testFollow, saveFollow, unfollow, following, followers } from "../controllers/follow.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = Router();

// Route Definitions with Descriptive Comments
// Test route for follow functionality
router.get('/test-follow', testFollow);

// Route to follow a user (requires authentication)
router.post("/follow", ensureAuth, saveFollow);

// Route to unfollow a user by ID (requires authentication)
router.delete("/unfollow/:id", ensureAuth, unfollow);

// Route to get the list of users the authenticated user is following (optional pagination)
router.get("/following/:id?/:page?", ensureAuth, following);

// Route to get the list of followers for the authenticated user (optional pagination)
router.get("/followers/:id?/:page?", ensureAuth, followers);

// Export Router for use in app
export default router;
