import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    // origin: process.env.CORS_ORIGIN,
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE"
}))

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(cookieParser());

// routes

import userRouter from "./routes/user.js";

app.use('/users', userRouter);


export { app };