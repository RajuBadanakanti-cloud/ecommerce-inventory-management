import express from "express"; 
import { getAllProducts, getProductById, updateProductById, deleteProductById} from "../controllers/productControllers.js";

const router = express.Router(); 

router.route("/all").get(getAllProducts) // all products

router.route("/:id").get(getProductById) // product details by id
router.route("/:id").put(updateProductById) // update product by id
router.route("/:id").delete(deleteProductById) // delete product by id

export default router