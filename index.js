import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import Hello from "./Hello.js";
import Lab5 from "./lab5/index.js";
import db from "./kambaz/database/index.js";
import UserRoutes from "./kambaz/users/routes.js";
import CourseRoutes from "./kambaz/courses/routes.js";
import ModulesRoutes from "./kambaz/modules/routes.js";
import AssignmentsRoutes from "./kambaz/assignments/routes.js";


const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING, {
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000,
});

const app = express();

// 1. CORS — must be first
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

// 2. Session — must come after cors, before express.json
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
  },
};
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    httpOnly: false,
  };
}
app.use(session(sessionOptions));

// 3. JSON body parser — must come after session, before routes
app.use(express.json());

// 4. Routes
UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
Hello(app);
Lab5(app);

app.listen(process.env.PORT || 4000);