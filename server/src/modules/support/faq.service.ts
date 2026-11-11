import { Types } from "mongoose";
import Faq from "../../database/faq.model.js";
import { AppError } from "../../utils/appError.utils.js";
import { createFaqSchema, updateFaqSchema } from "./support.validation.js";

const assertId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid FAQ id", 400);
};

export class FaqService {
  listPublished() {
    return Faq.find({ isPublished: true }).sort({ category: 1, sortOrder: 1, createdAt: 1 }).lean();
  }

  listAll() {
    return Faq.find().sort({ category: 1, sortOrder: 1, createdAt: 1 }).lean();
  }

  create(input: unknown) {
    return Faq.create(createFaqSchema.parse(input));
  }

  async update(id: string, input: unknown) {
    assertId(id);
    const data = updateFaqSchema.parse(input);
    const faq = await Faq.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!faq) throw new AppError("FAQ not found", 404);
    return faq;
  }

  async remove(id: string) {
    assertId(id);
    if (!(await Faq.findByIdAndDelete(id))) throw new AppError("FAQ not found", 404);
  }
}

export const faqService = new FaqService();
