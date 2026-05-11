const express = require("express");
//const { verifyToken } = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

// All routes require authentication
// router.use(verifyToken);

// Get all users
router.get("/", userController.getAllUsers);

// Get all roles
router.get("/roles", userController.getAllRoles);

// Get user by ID
router.get("/:id", userController.getUserById);

// Update user
router.put("/:id", userController.updateUser);

// Update user status (activate/deactivate)
router.patch("/:id/status", userController.updateUserStatus);

// Bulk update users status
router.patch("/bulk/status", userController.bulkUpdateUserStatus);

// Delete user (soft delete)
router.delete("/:id", userController.deleteUser);

// Hard delete user (permanent - admin only)
router.delete("/:id/permanent", userController.hardDeleteUser);

module.exports = router;