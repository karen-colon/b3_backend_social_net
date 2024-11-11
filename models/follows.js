import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Define the follow schema with unique constraints and pagination
const FollowSchema = new Schema({
  following_user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "El ID del usuario que sigue es obligatorio"]
  },
  followed_user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "El ID del usuario seguido es obligatorio"]
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Define a unique index to prevent duplicate follows between the same users
FollowSchema.index({ following_user: 1, followed_user: 1 }, { unique: true });

// Add pagination plugin for efficient data retrieval
FollowSchema.plugin(mongoosePaginate);

// Export the Follow model
export default model("Follow", FollowSchema, "follows");
// followServices.js

export const followThisUser = (userId, followedId) => {
  // Tu lógica para seguir a un usuario
};

export const followUserIds = (userId) => {
  // Tu lógica para obtener los IDs de los usuarios seguidos
};
