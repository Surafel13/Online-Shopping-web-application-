// src/seeds/Users.ts
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import type{IUser} from "../interface/user.interface.js";
import Users from "../database/users.model.js";

const oid = (hex: string) => new Types.ObjectId(hex);

const PLAIN_PASSWORD = "12345678";

/**
 * 20 seed users.
 * IDs are hardcoded so they are stable across runs and safe for
 * cross-references (orders, carts, reviews, etc.).
 * 3 admins, 17 customers, mixed activity status.
 */
const usersSeed: Array<Omit<IUser, "password"> & { password: string }> = [
  {
    _id: oid("650000000000000000000001"),
    username: "admin_alice",
    email: "alice.admin@example.com",
    password: PLAIN_PASSWORD,
    role: "admin",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=1",
    addresses: [
      {
        _id: oid("651000000000000000000001"),
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "IL",
        postalCode: "62701",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("650000000000000000000002"),
    username: "admin_bob",
    email: "bob.admin@example.com",
    password: PLAIN_PASSWORD,
    role: "admin",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=12",
    addresses: [
      {
        _id: oid("651000000000000000000002"),
        street: "221B Baker Street",
        city: "London",
        state: "Greater London",
        postalCode: "NW1 6XE",
        country: "UK",
      },
    ],
  },
  {
    _id: oid("650000000000000000000003"),
    username: "admin_carol",
    email: "carol.admin@example.com",
    password: PLAIN_PASSWORD,
    role: "admin",
    isActive: false,
    profileImg: "https://i.pravatar.cc/150?img=20",
    addresses: [],
  },
  {
    _id: oid("650000000000000000000004"),
    username: "john_doe",
    email: "john.doe@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=3",
    addresses: [
      {
        _id: oid("651000000000000000000004"),
        street: "1600 Pennsylvania Ave NW",
        city: "Washington",
        state: "DC",
        postalCode: "20500",
        country: "USA",
      },
      {
        _id: oid("651000000000000000000005"),
        street: "10 Downing Street",
        city: "London",
        state: "Greater London",
        postalCode: "SW1A 2AA",
        country: "UK",
      },
    ],
  },
  {
    _id: oid("650000000000000000000005"),
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=5",
    addresses: [
      {
        _id: oid("651000000000000000000006"),
        street: "1 Infinite Loop",
        city: "Cupertino",
        state: "CA",
        postalCode: "95014",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("650000000000000000000006"),
    username: "mike_brown",
    email: "mike.brown@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("651000000000000000000007"),
        street: "350 Fifth Avenue",
        city: "New York",
        state: "NY",
        postalCode: "10118",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("650000000000000000000007"),
    username: "emily_davis",
    email: "emily.davis@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: false,
    addresses: [
      {
        _id: oid("651000000000000000000008"),
        street: "4 Privet Drive",
        city: "Little Whinging",
        state: "Surrey",
        postalCode: "GU21 4AA",
        country: "UK",
      },
    ],
  },
  {
    _id: oid("650000000000000000000008"),
    username: "david_wilson",
    email: "david.wilson@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [],
  },
  {
    _id: oid("650000000000000000000009"),
    username: "sarah_johnson",
    email: "sarah.johnson@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=9",
    addresses: [
      {
        _id: oid("651000000000000000000009"),
        street: "501 Stanyan Street",
        city: "San Francisco",
        state: "CA",
        postalCode: "94117",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("65000000000000000000000a"),
    username: "chris_miller",
    email: "chris.miller@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("65100000000000000000000a"),
        street: "99 Bishopsgate",
        city: "London",
        state: "Greater London",
        postalCode: "EC2M 3XD",
        country: "UK",
      },
    ],
  },
  {
    _id: oid("65000000000000000000000b"),
    username: "lisa_anderson",
    email: "lisa.anderson@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("65100000000000000000000b"),
        street: "4059 Mt Lee Drive",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90068",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("65000000000000000000000c"),
    username: "james_taylor",
    email: "james.taylor@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: false,
    addresses: [],
  },
  {
    _id: oid("65000000000000000000000d"),
    username: "patricia_thomas",
    email: "patricia.thomas@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=15",
    addresses: [
      {
        _id: oid("65100000000000000000000d"),
        street: "350 5th Avenue",
        city: "New York",
        state: "NY",
        postalCode: "10118",
        country: "USA",
      },
      {
        _id: oid("65100000000000000000000e"),
        street: "600 Montgomery Street",
        city: "San Francisco",
        state: "CA",
        postalCode: "94111",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("65000000000000000000000e"),
    username: "robert_martinez",
    email: "robert.martinez@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("65100000000000000000000f"),
        street: "1 Microsoft Way",
        city: "Redmond",
        state: "WA",
        postalCode: "98052",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("65000000000000000000000f"),
    username: "jennifer_garcia",
    email: "jennifer.garcia@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=25",
    addresses: [
      {
        _id: oid("651000000000000000000010"),
        street: "Rue de Rivoli",
        city: "Paris",
        state: "Île-de-France",
        postalCode: "75001",
        country: "France",
      },
    ],
  },
  {
    _id: oid("650000000000000000000010"),
    username: "william_rodriguez",
    email: "william.rodriguez@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("651000000000000000000011"),
        street: "Unter den Linden 77",
        city: "Berlin",
        state: "Berlin",
        postalCode: "10117",
        country: "Germany",
      },
    ],
  },
  {
    _id: oid("650000000000000000000011"),
    username: "linda_lee",
    email: "linda.lee@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("651000000000000000000012"),
        street: "1 Chome-1-2 Oshiage",
        city: "Tokyo",
        state: "Sumida",
        postalCode: "131-0045",
        country: "Japan",
      },
    ],
  },
  {
    _id: oid("650000000000000000000012"),
    username: "thomas_walker",
    email: "thomas.walker@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: false,
    addresses: [],
  },
  {
    _id: oid("650000000000000000000013"),
    username: "barbara_hall",
    email: "barbara.hall@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    profileImg: "https://i.pravatar.cc/150?img=32",
    addresses: [
      {
        _id: oid("651000000000000000000013"),
        street: "4 Yawkey Way",
        city: "Boston",
        state: "MA",
        postalCode: "02215",
        country: "USA",
      },
    ],
  },
  {
    _id: oid("650000000000000000000014"),
    username: "daniel_allen",
    email: "daniel.allen@example.com",
    password: PLAIN_PASSWORD,
    role: "customer",
    isActive: true,
    addresses: [
      {
        _id: oid("651000000000000000000014"),
        street: "123 Queen Street West",
        city: "Toronto",
        state: "Ontario",
        postalCode: "M5H 2M9",
        country: "Canada",
      },
      {
        _id: oid("651000000000000000000015"),
        street: "456 Rue Sainte-Catherine",
        city: "Montreal",
        state: "Quebec",
        postalCode: "H3B 1A9",
        country: "Canada",
      },
    ],
  },
];

/**
 * Seeds the users collection.
 * - Idempotent: uses `email` as the natural key with `$setOnInsert` + upsert.
 * - Re-running is safe: existing users are left untouched.
 * - Passwords are hashed once per run with bcrypt.
 */
async function seedUsers(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in environment");
  }

  console.log("→ Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓ Connected");

  try {
    console.log("→ Hashing seed password...");
    const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 10);
    console.log("✓ Password hashed");

    let created = 0;
    let skipped = 0;

    for (const seedUser of usersSeed) {
      const result = await Users.updateOne(
        { email: seedUser.email },
        {
          $setOnInsert: {
            ...seedUser,
            password: hashedPassword,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        created++;
        console.log(`  + created  ${seedUser.email}`);
      } else {
        skipped++;
        console.log(`  · skipped  ${seedUser.email} (already exists)`);
      }
    }

    console.log(
      `\n✓ Users seeded: ${created} created, ${skipped} skipped (total ${usersSeed.length})`,
    );
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected");
  }
}

seedUsers()
  .then(() => {
    console.log("✓ Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
