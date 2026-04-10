import mongoose from "mongoose";
import "dotenv/config";
import courseModel from "./kambaz/courses/model.js";
import db from "./kambaz/database/index.js";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
await mongoose.connect(CONNECTION_STRING);

const coursesWithModules = db.courses.map((course) => ({
  ...course,
  modules: db.modules
    .filter((m) => m.course === course._id)
    .map((m) => ({
      _id: m._id,
      name: m.name,
      description: m.description,
      lessons: m.lessons || [],
    })),
}));

await courseModel.deleteMany({});
await courseModel.insertMany(coursesWithModules);
console.log("✅ Courses seeded with embedded modules!");
mongoose.disconnect();