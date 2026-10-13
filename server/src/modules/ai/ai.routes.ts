import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { chatController } from "./ai.controller.js";

const router = Router();

router.post(
  "/chat",
  authMiddleware,
  chatController,
);

export default router;