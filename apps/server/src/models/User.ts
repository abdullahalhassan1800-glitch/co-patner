import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  phone: string;
  password?: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  country: string;
  bio: string;
  interests: string[];
  credits: number;
  isPremium: boolean;
  reportCount: number;
  isBanned: boolean;
  friends: string[];
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    password: { type: String },
    name: { type: String, default: "" },
    avatar: { type: String, default: "/default-avatar.png" },
    gender: { type: String, default: "other" },
    age: { type: Number, default: 18 },
    country: { type: String, default: "IN" },
    bio: { type: String, default: "" },
    interests: [{ type: String }],
    credits: { type: Number, default: 10 },
    isPremium: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    friends: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
