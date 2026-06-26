import { Router } from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  markContactAsReplied,
  updateContact,
} from "./contact.controller.js";
import { validateContactInput } from "./contact.validator.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { MANAGEMENT_ROLES } from "../constants/roles.js";

const router = Router();

router.post("/", validateContactInput, createContact);
router.get("/", authMiddleware, authorize(...MANAGEMENT_ROLES), getAllContacts);
router.get("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), getContactById);
router.put("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), updateContact);
router.patch("/:id/reply", authMiddleware, authorize(...MANAGEMENT_ROLES), markContactAsReplied);
router.delete("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), deleteContact);

export default router;
