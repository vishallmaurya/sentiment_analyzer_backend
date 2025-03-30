import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({
    origin: [process.env.LOCAL_CORS, process.env.CORS_ORIGIN, process.env.AWS_CORS],
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(cookieParser());

// routes

import userRouter from "./routes/user.js";
import apiRouter from "./routes/api.js";

app.use('/users', userRouter);
app.use('/api', apiRouter);

export { app };