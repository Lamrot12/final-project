const { pool } = require("../config/database");

// Get all users with their role names
const getAllUsers = async () => {
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.is_active,
      u.created_at,
      u.role_id,
      r.role_name
    FROM users u
    LEFT JOIN user_role r ON u.role_id = r.role_id
    ORDER BY u.created_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Get user by ID with role name
const getUserById = async (user_id) => {
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.is_active,
      u.created_at,
      u.role_id,
      r.role_name
    FROM users u
    LEFT JOIN user_role r ON u.role_id = r.role_id
    WHERE u.user_id = $1
  `;

  const result = await pool.query(query, [user_id]);
  return result.rows[0];
};

// Update user
const updateUser = async (user_id, updateData) => {
  const { full_name, email, phone, is_active, role_id } = updateData;

  const query = `
    UPDATE users 
    SET 
      full_name = COALESCE($1, full_name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      is_active = COALESCE($4, is_active),
      role_id = COALESCE($5, role_id),
      updated_at = NOW()
    WHERE user_id = $6
    RETURNING 
      user_id,
      full_name,
      email,
      phone,
      is_active,
      created_at,
      role_id
  `;

  const values = [
    full_name,
    email,
    phone,
    is_active,
    role_id,
    user_id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update user status only (activate/deactivate)
const updateUserStatus = async (user_id, is_active) => {
  const query = `
    UPDATE users 
    SET 
      is_active = $1,
      updated_at = NOW()
    WHERE user_id = $2
    RETURNING 
      user_id,
      full_name,
      email,
      is_active
  `;

  const result = await pool.query(query, [is_active, user_id]);
  return result.rows[0];
};

// Get all available roles
const getAllRoles = async () => {
  const query = `
    SELECT role_id, role_name 
    FROM user_role 
    ORDER BY role_name
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Delete user (soft delete - deactivate)
const deleteUser = async (user_id) => {
  const query = `
    UPDATE users 
    SET 
      is_active = false,
      deleted_at = NOW()
    WHERE user_id = $1
    RETURNING user_id, full_name, email
  `;

  const result = await pool.query(query, [user_id]);
  return result.rows[0];
};

// Hard delete user (remove completely)
const hardDeleteUser = async (user_id) => {
  const query = `
    DELETE FROM users 
    WHERE user_id = $1 
    RETURNING user_id
  `;

  const result = await pool.query(query, [user_id]);
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getAllRoles,
  deleteUser,
  hardDeleteUser
};