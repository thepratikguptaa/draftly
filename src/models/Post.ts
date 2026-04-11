import mongoose, { Schema, models, model } from "mongoose";

export interface IPost {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  imageUrl?: string;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 280 },
  imageUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Post = models.Post || model<IPost>("Post", PostSchema);
