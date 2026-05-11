const userModel = require("../models/users.model");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Validate email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const allUsers = await userModel.getAllUsers();

      const emailExists = allUsers.some(
        (user) => user.email === updateData.email
      );

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    const updatedUser = await userModel.updateUser(id, updateData);

    // Get updated user with role name
    const userWithRole = await userModel.getUserById(id);

    res.json({
      success: true,
      message: "User updated successfully",
      user: userWithRole
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value"
      });
    }

    // Check if user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updatedUser = await userModel.updateUserStatus(id, is_active);

    res.json({
      success: true,
      message: `User ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message
    });
  }
};

// Get all available roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await userModel.getAllRoles();

    res.json({
      success: true,
      roles: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message
    });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const deletedUser = await userModel.deleteUser(id);

    res.json({
      success: true,
      message: "User deactivated successfully",
      user: deletedUser
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// Hard delete user (permanent)
const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const deletedUser = await userModel.hardDeleteUser(id);

    res.json({
      success: true,
      message: "User permanently deleted",
      user_id: deletedUser?.user_id
    });
  } catch (error) {
    console.error("Error hard deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete user",
      error: error.message
    });
  }
};

// Bulk update users status
const bulkUpdateUserStatus = async (req, res) => {
  try {
    const { user_ids, is_active } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "user_ids array is required"
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value"
      });
    }

    const results = [];

    for (const user_id of user_ids) {
      const updatedUser = await userModel.updateUserStatus(
        user_id,
        is_active
      );

      results.push(updatedUser);
    }

    res.json({
      success: true,
      message: `${results.length} users ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      users: results
    });
  } catch (error) {
    console.error("Error bulk updating users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update users",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getAllRoles,
  deleteUser,
  hardDeleteUser,
  bulkUpdateUserStatus
};