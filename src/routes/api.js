import { Router } from "express";
import { predictTweetSentiment } from "../controllers/api.js";

const apiRouter = Router();

apiRouter.route("/predict").post(predictTweetSentiment);

export default apiRouter;