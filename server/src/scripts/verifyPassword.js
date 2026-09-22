import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
dotenv.config({ path: "./.env" });

await mongoose.connect(`${process.env.MONGODB_URI}/mejorproject`);

const user = await mongoose.connection.collection("users").findOne({ username: "parinay" });

console.log("User found in MongoDB:", user ? "YES" : "NO");
if (user) {
  console.log("Stored password hash:", user.password);
  
  // Test a few common passwords
  const testPasswords = ["123456", "parinay", "password", "Parinay", "parinay123"];
  for (const pwd of testPasswords) {
    const match = await bcrypt.compare(pwd, user.password);
    console.log(`Password "${pwd}": ${match ? "✅ MATCH" : "❌ no match"}`);
  }
}

await mongoose.disconnect();
process.exit(0);
