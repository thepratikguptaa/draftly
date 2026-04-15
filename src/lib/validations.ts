import { z } from "zod";
import mongoose from "mongoose";

// Custom Zod refinement for MongoDB ObjectId
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID",
});

export const createPostSchema = z.object({
  text: z.string().min(1, "Text is required").max(280, "Max 280 characters"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updatePostSchema = z.object({
  text: z.string().min(1, "Text is required").max(280, "Max 280 characters"),
});

export const refactorSchema = z.object({
  text: z.string().min(1, "Text is required").max(280, "Max 280 characters"),
  style: z.enum(["basic", "professional", "casual", "funny", "concise"]),
});

export const createCommentSchema = z.object({
  postId: objectId,
  text: z.string().min(1, "Text is required").max(280, "Max 280 characters"),
});

export const likeSchema = z.object({
  postId: objectId,
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const idParamSchema = objectId;

export const searchQuerySchema = z.string().max(100).optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
