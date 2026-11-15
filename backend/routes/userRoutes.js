import express from "express";
import {deleteUser, getAllUsers, getUser, updateUser} from "../controllers/userControllers.js";
import {protect, redirectTo} from "../middlewares/authMiddlewares.js"
const router = express.Router();

router.route("/all").get(protect, getAllUsers)
router.route("/:id").get(protect, redirectTo("admin"), getUser)
router.route("/update/:id").patch(protect, redirectTo("admin"), updateUser)
router.route("/delete/:id").delete(protect, redirectTo("admin"), deleteUser)

export default router