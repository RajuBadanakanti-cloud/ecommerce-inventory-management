
import express from "express";

import {
  getInventory,
  getInventoryMovements,
  adjustInventory,
} from "../controllers/inventoryControllers.js";

import {
  protect,
  restrictTo,
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.use(protect, restrictTo("admin")); // All inventory routes require admin authentication

router.get("/", getInventory); // GET inventory
router.get("/movements", getInventoryMovements); // Admin inventory movements with pagination
router.post("/:id/adjust", adjustInventory); // POST inventory Stock adjusts


export default router;
