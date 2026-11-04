import "dotenv/config";
import mongoose from "mongoose";
import Permission from "../database/permission.model.js";
import Role from "../database/role.model.js";
import Users from "../database/users.model.js";
import {
  PERMISSION_MODULES,
  STANDARD_ACTIONS,
} from "../modules/rbac/rbac.constants.js";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");
  await mongoose.connect(uri);

  try {
    for (const module of PERMISSION_MODULES) {
      for (const action of STANDARD_ACTIONS) {
        const code = `${module}:${action}`;
        await Permission.updateOne(
          { code },
          {
            $setOnInsert: {
              name: `${cap(action)} ${cap(module)}`,
              code,
              module,
              action,
              description: `Allows ${action} access to ${module}.`,
              isSystem: true,
            },
          },
          { upsert: true },
        );
      }
    }

    const all = await Permission.find({ isSystem: true })
      .select("_id code")
      .lean();
    const pick = (fn: (code: string) => boolean) =>
      all.filter((p: any) => fn(p.code)).map((p: any) => p._id);

    const roles = [
      {
        name: "Store Admin",
        description: "Full access to every admin module.",
        isSystem: true,
        permissions: pick(() => true),
      },
      {
        name: "Catalog Manager",
        description: "Manage products and inventory.",
        isSystem: false,
        permissions: pick(
          (c) => c.startsWith("products:") || c.startsWith("inventory:"),
        ),
      },
      {
        name: "Sales Manager",
        description: "Manage orders and payments; view customers.",
        isSystem: false,
        permissions: pick(
          (c) =>
            c.startsWith("orders:") ||
            c.startsWith("payments:") ||
            c === "customers:view",
        ),
      },
      {
        name: "Read-only Analyst",
        description: "View-only access with reports.",
        isSystem: false,
        permissions: pick((c) => c.endsWith(":view")),
      },
    ];
    for (const role of roles) {
      await Role.updateOne(
        { name: role.name },
        { $setOnInsert: role },
        { upsert: true },
      );
    }

    // Migration: existing admins keep today's full access
    const full: any = await Role.findOne({ name: "Store Admin" });
    const res = await Users.updateMany(
      {
        role: "admin",
        adminRole: null,
        $or: [
          { directPermissions: { $exists: false } },
          { directPermissions: { $size: 0 } },
        ],
      },
      { $set: { adminRole: full._id } },
    );
    console.log(
      `✓ Permissions & roles seeded. Legacy admins migrated: ${res.modifiedCount}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Seed failed:", e);
    process.exit(1);
  });
