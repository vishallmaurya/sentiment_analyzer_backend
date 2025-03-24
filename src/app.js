import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,POST,PUT,DELETE"
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