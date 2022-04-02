import express from "express";
const router = express.Router();

import * as productController from "../api/controllers/products";

router.post("/", productController.createAProduct);
router.patch("/:productId", productController.updateAProduct);
router.get("/", productController.getAllProduct);
router.get("/:productId", productController.getAProduct);
router.delete("/", productController.deleteAProduct);

export default router;
