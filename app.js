import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import fileRoutes from "./routes/fileRoutes.js";
import authRoutes from "./routes/auth.route.js"; 
import {protectRoute} from "./middleware/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/files", protectRoute, fileRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error(err));
