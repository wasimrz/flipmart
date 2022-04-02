import express from "express";
const router = express.Router();

import * as categoryController from "../api/controllers/categories";

router.post("/", categoryController.createCategories);

export default router;
