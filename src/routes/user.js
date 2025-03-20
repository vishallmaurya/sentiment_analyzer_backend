import { Router } from "express";
import { authUser } from "../middlewares/authUser.js";
import { changePassword, forgetPassword, getCurrentUser, logoutUser, refreshAccessToken, registerUser, resetPassowrd, getTweetsHistory } from "../controllers/user.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/logout").post(authUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(authUser, changePassword);
router.route("/current-user").post(authUser, getCurrentUser);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password/:token").post(resetPassowrd);
router.route("/tweets").post(authUser, getTweetsHistory);
// router.route("/save-data").post(authUser);

export default router;