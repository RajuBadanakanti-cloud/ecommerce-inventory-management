import express from "express";

import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
    clearCart
} from "../controllers/cartControllers.js";

import {protect} from "../middlewares/authMiddlewares.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect); // imp

router.route("/").get(getCart) // get all cart itens
router.route("/").post(addToCart) // add item into cart
router.route("/").delete(clearCart); // clear all cart items


router.patch("/:itemId", updateCartQuantity); // update product quantity
router.delete("/:itemId", removeCartItem); // delete selected product from cart

export default router;
