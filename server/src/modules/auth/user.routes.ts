import { Router } from "express";

import { loginUserController, registerUser,getProfile } from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUserController);
router.get("/profile",authMiddleware,getProfile);
export default router;