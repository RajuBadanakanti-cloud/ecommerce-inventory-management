import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryControllers.js";

const router = express.Router();

router.post("/add", createCategory); // create a new category
router.get("/", getAllCategories); // Get all categories
router.patch("/:id", updateCategory); // Update a category
router.delete("/:id", deleteCategory); // Delete a category


export default router;