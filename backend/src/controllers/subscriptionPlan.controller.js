const { SubscriptionPlanModel } = require("../models/subscriptionPlan.model.js");

const create = async (req, res) => {
  try {
    const plan = await SubscriptionPlanModel.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error creating subscription plan", error });
  }
};

const getAll = async (req, res) => {
  try {
    const plans = await SubscriptionPlanModel.findAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription plans", error });
  }
};

const getById = async (req, res) => {
  try {
    const plan = await SubscriptionPlanModel.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription plan", error });
  }
};

const update = async (req, res) => {
  try {
    const updated = await SubscriptionPlanModel.update(
      req.params.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription plan", error });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await SubscriptionPlanModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json({ message: "Subscription plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subscription plan", error });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};