import express from "express";
import {deleteUser, getAllUsers, getUser, updateUser} from "../controllers/userControllers.js";
import {protect} from "../middlewares/authMiddlewares.js"
const router = express.Router();

router.route("/all").get(protect, getAllUsers)
router.route("/:id").get(protect, getUser)
router.route("/update/:id").patch(protect,  updateUser)
router.route("/delete/:id").delete(protect,  deleteUser)

export default router