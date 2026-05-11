const { AdvertisementModel } = require("../models/advertisement.model.js");

// CREATE
const createAd = async (req, res) => {
  try {
    let advertisement_image = null;
    let receipt_image_url = null;

    // Cloudinary files
    if (req.files?.advertisement_image) {
      advertisement_image = req.files.advertisement_image[0].path;
    }

    if (req.files?.receipt_image) {
      receipt_image_url = req.files.receipt_image[0].path;
    }

    const newAd = await AdvertisementModel.create({
      ...req.body,
      advertisement_image,
      receipt_image_url,
    });

    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
const getAllAds = async (req, res) => {
  try {
    const ads = await AdvertisementModel.findAll();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
const getAdById = async (req, res) => {
  try {
    const ad = await AdvertisementModel.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateAd = async (req, res) => {
  try {
    let advertisement_image = req.body.advertisement_image;
    let receipt_image_url = req.body.receipt_image_url;

    if (req.files?.advertisement_image) {
      advertisement_image = req.files.advertisement_image[0].path;
    }

    if (req.files?.receipt_image) {
      receipt_image_url = req.files.receipt_image[0].path;
    }

    const updated = await AdvertisementModel.update(req.params.id, {
      ...req.body,
      advertisement_image,
      receipt_image_url,
    });

    if (!updated) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteAd = async (req, res) => {
  try {
    const deleted = await AdvertisementModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
};