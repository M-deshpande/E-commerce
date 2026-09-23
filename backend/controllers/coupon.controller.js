import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: "No active coupon found for this user" });
        }
        res.json(coupon || null);
    } catch(error) {
        console.log("Error in getCoupon controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

