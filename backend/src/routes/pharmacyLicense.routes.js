const express = require("express");
const router = express.Router();

const {
  createLicense,
  getAllLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
} = require("../controllers/pharmacyLicense.controller");

const upload = require("../middleware/upload");

router.post(
  "/",
  upload.single("license_document"),
  createLicense
);

router.get("/", getAllLicenses);

router.get("/:id", getLicenseById);

router.put(
  "/:id",
  upload.single("license_document"),
  updateLicense
);

router.delete("/:id", deleteLicense);

module.exports = router;