const { AdvertisementPlanModel } = require("../models/advertisementPlan.model.js");

const create = async (req, res) => {
  try {
    const plan = await AdvertisementPlanModel.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error creating plan", error });
  }
};

const getAll = async (req, res) => {
  try {
    const plans = await AdvertisementPlanModel.findAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans", error });
  }
};

const getById = async (req, res) => {
  try {
    const plan = await AdvertisementPlanModel.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plan", error });
  }
};

const update = async (req, res) => {
  try {
    const updated = await AdvertisementPlanModel.update(
      req.params.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating plan", error });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await AdvertisementPlanModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting plan", error });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};