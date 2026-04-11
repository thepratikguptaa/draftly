import mongoose, { Schema, models, model } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 280 },
  createdAt: { type: Date, default: Date.now },
});

export const Comment = models.Comment || model<IComment>("Comment", CommentSchema);
