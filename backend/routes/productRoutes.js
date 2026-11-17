import express from "express"; 
import { getAllProducts, createProduct, getProductById, updateProductById, deleteProductById} from "../controllers/productControllers.js";
import { protect, restrictTo } from "../middlewares/authMiddlewares.js";

const router = express.Router(); 


router.route("/all").get(getAllProducts);

// Admin: Can see active and inactive products
router.route("/admin").get(protect, restrictTo("admin"), getAllProducts);
router.route("/").post( protect, restrictTo("admin"),  createProduct);

router.route("/:id").get(getProductById) // product details by id
router.route("/:id").put(updateProductById) // update product by id
router.route("/:id").delete(deleteProductById) // delete product by id

export default router