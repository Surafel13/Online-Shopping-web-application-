import mongoose from "mongoose";
import type { IFaq } from "../interface/support.interface.js";

const faqSchema = new mongoose.Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, trim: true, default: "General" },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
faqSchema.index({ isPublished: 1, category: 1, sortOrder: 1 });

const Faq = mongoose.model<IFaq>("Faq", faqSchema);
export default Faq;
