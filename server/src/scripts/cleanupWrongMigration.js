import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "./.env" });

await mongoose.connect(`${process.env.MONGODB_URI}/mejorproject`);

const toDelete = ["parinay", "aniket sharma", "vishu", "anikethuma"];
const result = await mongoose.connection.collection("users").deleteMany({
  username: { $in: toDelete }
});
console.log("Deleted:", result.deletedCount, "incorrectly migrated users");
await mongoose.disconnect();
process.exit(0);
