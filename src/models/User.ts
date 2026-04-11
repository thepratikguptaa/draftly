import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image: string;
  isPremium: boolean;
  dailyRefactorCount: number;
  lastRefactorDate: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  image: { type: String, default: "" },
  isPremium: { type: Boolean, default: false },
  dailyRefactorCount: { type: Number, default: 0 },
  lastRefactorDate: { type: Date, default: new Date(0) },
});

export const User = models.User || model<IUser>("User", UserSchema);
