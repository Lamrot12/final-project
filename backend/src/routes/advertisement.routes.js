const express = require("express");
const {
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
} = require("../controllers/advertisement.controller.js");

// 👇 multer cloudinary middleware
const upload = require("../middleware/upload.js");

const router = express.Router();

// Multiple images upload
router.post(
  "/",
  upload.fields([
    { name: "advertisement_image", maxCount: 1 },
    { name: "receipt_image", maxCount: 1 },
  ]),
  createAd
);

router.get("/", getAllAds);
router.get("/:id", getAdById);

router.put(
  "/:id",
  upload.fields([
    { name: "advertisement_image", maxCount: 1 },
    { name: "receipt_image", maxCount: 1 },
  ]),
  updateAd
);

router.delete("/:id", deleteAd);

module.exports = router;