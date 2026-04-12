import mongoose, { Schema, models, model } from "mongoose";

export interface ILike {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = models.Like || model<ILike>("Like", LikeSchema);
