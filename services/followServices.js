import Follow from "../models/follows.js";

// Get arrays of IDs for users the authenticated user is following and users who follow the authenticated user
export const getFollowUserIds = async (req, res) => {
  try {
    // Obtain the authenticated user's ID
    const userId = req.user.userId;

    // Check if the user ID is available
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID not received"
      });
    }

    // Retrieve IDs of users the authenticated user is following
    const following = await Follow.find({ following_user: userId })
      .select({ followed_user: 1, _id: 0 })
      .exec();

    // Retrieve IDs of users who are following the authenticated user
    const followers = await Follow.find({ followed_user: userId })
      .select({ following_user: 1, _id: 0 })
      .exec();

    // Map results to arrays of IDs
    const followingIds = following.map(follow => follow.followed_user);
    const followerIds = followers.map(follow => follow.following_user);

    return res.status(200).json({
      following: followingIds,
      followers: followerIds
    });

  } catch (error) {
    console.error("Error retrieving follow user IDs:", error);
    return res.status(500).json({
      following: [],
      followers: []
    });
  }
};

// Get follow status between authenticated user and a specific profile user
export const getFollowStatus = async (userId, profileUserId) => {
  try {
    // Validate that both user IDs are provided
    if (!userId || !profileUserId) {
      throw new Error("User IDs are invalid or missing");
    }

    // Check if the authenticated user is following the profile user
    const isFollowing = await Follow.findOne({ following_user: userId, followed_user: profileUserId });

    // Check if the profile user is following the authenticated user
    const isFollower = await Follow.findOne({ following_user: profileUserId, followed_user: userId });

    return {
      following: isFollowing !== null,
      follower: isFollower !== null
    };

  } catch (error) {
    console.error("Error retrieving follow status:", error);
    return {
      following: false,
      follower: false
    };
  }
};
