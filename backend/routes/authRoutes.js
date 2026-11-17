import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMe,
  refreshAccessToken
} from "../controllers/authControllers.js";
import {protect} from "../middlewares/authMiddlewares.js"

const router = express.Router();

router.route("/register").post( registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.post("/refresh", refreshAccessToken); // refreshToken generating
router.route("/me").get(protect, getMe); // get current user profile, protected route
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);


export default router;
