import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // Campo obligatorio y único
    name: { type: String, required: true },
    username: { type: String, required: true },
    image: { type: String },
    bio: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Community = mongoose.models.Community || mongoose.model("Community", CommunitySchema);

export default Community;