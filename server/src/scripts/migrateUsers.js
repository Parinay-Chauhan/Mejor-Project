/**
 * One-time migration script: copies users from data/users.json → MongoDB
 * Run with: node src/scripts/migrateUsers.js
 */

import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inline the User schema to avoid circular deps in a script
import { User } from "../models/user.model.js";

const usersFile = path.join(__dirname, "..", "..", "data", "users.json");

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("✅ Connected to MongoDB\n");

  const content = await fs.readFile(usersFile, "utf-8");
  const jsonUsers = JSON.parse(content);

  console.log(`Found ${jsonUsers.length} users in users.json:\n`);

  for (const jsonUser of jsonUsers) {
    const username = (jsonUser.username || jsonUser.id).trim().toLowerCase();

    // Skip if already in MongoDB
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${username}`);
      continue;
    }

    // Use raw collection insert to bypass pre-save hook (password is already hashed)
    await mongoose.connection.collection("users").insertOne({
      username,
      password: jsonUser.passwordHash, // already bcrypt hashed — skip the hook
      createdAt: new Date(jsonUser.createdAt || Date.now()),
      updatedAt: new Date(),
    });

    console.log(`✅ Migrated: ${username}`);
  }

  console.log("\nMigration complete!");
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
