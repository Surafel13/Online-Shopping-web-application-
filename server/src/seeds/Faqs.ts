import "dotenv/config";
import mongoose from "mongoose";
import Faq from "../database/faq.model.js";

const faqs = [
  ["Orders", "How can I track my order?", "Open My Orders from your account menu to see the live status of every order. You will also get a notification whenever the status changes."],
  ["Orders", "Can I cancel or change an order?", "Orders can be cancelled while they are still pending. Open a support ticket under the Order category and we will help right away."],
  ["Shipping", "How long does delivery take?", "Delivery times depend on your location. Most orders arrive within 3-7 business days, and orders over $150 ship free."],
  ["Returns", "What is your return policy?", "You can return unused items within 30 days of delivery. Open a ticket under Returns with your order and we will send instructions."],
  ["Payments", "Which payment methods do you accept?", "We accept major credit and debit cards. If a payment fails, check your card details or contact us via a Payment ticket."],
  ["Account", "How do I reset my password?", "Go to Profile > Account Security to change your password. If you cannot sign in, open a ticket under Account."],
] as const;

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");
  await mongoose.connect(uri);
  try {
    let created = 0;
    for (const [i, [category, question, answer]] of faqs.entries()) {
      const res = await Faq.updateOne(
        { question },
        { $setOnInsert: { category, question, answer, sortOrder: i, isPublished: true } },
        { upsert: true },
      );
      if (res.upsertedCount > 0) created++;
    }
    console.log(`✓ FAQs seeded: ${created} created, ${faqs.length - created} skipped`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().then(() => process.exit(0)).catch((e) => { console.error("✗ Seed failed:", e); process.exit(1); });
