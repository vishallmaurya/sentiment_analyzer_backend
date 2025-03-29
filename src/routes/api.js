import { Router } from "express";
// import { predictTweetSentiment, predictTaskStatus } from "../controllers/api.js";
import { predictTweetSentiment } from "../controllers/api.js";

const apiRouter = Router();

apiRouter.route("/predict").post(predictTweetSentiment);
// apiRouter.route("/predict/status/:taskId").get(predictTaskStatus);
export default apiRouter;