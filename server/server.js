import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ml", mlRoutes);

const PORT = process.env.PORT || 5000;
connectDB();

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
