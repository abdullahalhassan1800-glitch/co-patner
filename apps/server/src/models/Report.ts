import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reporter: string;
  reported: string;
  reason: string;
  description: string;
  status: string;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: String, required: true },
    reported: { type: String, required: true },
    reason: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReport>("Report", ReportSchema);
