import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Users from "../database/users.model.js";

async function seedSuperAdmin(): Promise<void> {
  const uri = process.env.MONGO_URI;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const username = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  if (!uri) throw new Error("MONGO_URI is not set");
  if (!email || !password) {
    throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set");
  }
  if (password.length < 8) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters");
  }

  await mongoose.connect(uri);
  console.log("✓ Connected");

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Existing accounts are promoted (password untouched); new ones are created.
    const result = await Users.updateOne(
      { email },
      {
        $set: { role: "super_admin", isActive: true },
        $setOnInsert: { username, password: hashed, addresses: [] },
      },
      { upsert: true },
    );

    console.log(
      result.upsertedCount > 0
        ? `✓ Super admin created: ${email}`
        : `✓ Existing user promoted to super admin: ${email}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seedSuperAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
