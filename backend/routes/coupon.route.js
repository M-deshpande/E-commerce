import express from "express";
import {
    getCoupon
} from "../controllers/coupon.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);

export default router;