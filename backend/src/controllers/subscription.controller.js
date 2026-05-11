const { SubscriptionModel } = require("../models/subscription.model");
const { pool } = require("../config/database");



// helper: calculate end_date from plan duration
const calculateEndDate = async (plan_id, start_date) => {
  const planResult = await pool.query(
    "SELECT duration_days FROM subscription_plan WHERE plan_id = $1",
    [plan_id]
  );

  if (!planResult.rows[0]) {
    throw new Error("Invalid plan_id");
  }

  const duration = planResult.rows[0].duration_days;

  const start = new Date(start_date);
  start.setDate(start.getDate() + duration);

  return start.toISOString().split("T")[0]; // YYYY-MM-DD
};

const create = async (req, res) => {
  try {
    const { plan_id, start_date } = req.body;

    const end_date = await calculateEndDate(plan_id, start_date);

    const subscription = await SubscriptionModel.create({
      ...req.body,
      end_date,
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({
      message: "Error creating subscription",
      error: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const data = await SubscriptionModel.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
  }
};

const getById = async (req, res) => {
  try {
    const data = await SubscriptionModel.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription", error });
  }
};

const update = async (req, res) => {
  try {
    const updated = await SubscriptionModel.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription", error });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await SubscriptionModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subscription", error });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};