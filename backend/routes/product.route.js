import express from "express";
import { 
    createProduct, 
    deleteProduct, 
    getAllProducts, 
    getFeaturedProducts, 
    getRecommendedProducts,
    getProductsByCategory,
    toggleFeaturedProduct
 } from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.put("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;