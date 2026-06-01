const PharmacyLicenseModel = require(
  "../models/pharmacyLicense.model"
);

const createLicense = async (req, res) => {
  try {
    let license_document_url = null;

    if (req.file) {
      license_document_url = req.file.path;
    }

    const license =
      await PharmacyLicenseModel.create({
        ...req.body,
        license_document_url,
      });

    res.status(201).json(license);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const getAllLicenses = async (req, res) => {
  try {
    const licenses =
      await PharmacyLicenseModel.findAll();

    res.json(licenses);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getLicenseById = async (req, res) => {
  try {
    const license =
      await PharmacyLicenseModel.findById(
        req.params.id
      );

    if (!license) {
      return res.status(404).json({
        message: "License not found",
      });
    }

    res.json(license);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const updateLicense = async (req, res) => {
  try {
    let license_document_url =
      req.body.license_document_url;

    if (req.file) {
      license_document_url = req.file.path;
    }

    const updated =
      await PharmacyLicenseModel.update(
        req.params.id,
        {
          ...req.body,
          license_document_url,
        }
      );

    if (!updated) {
      return res.status(404).json({
        message: "License not found",
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const deleteLicense = async (req, res) => {
  try {
    const deleted =
      await PharmacyLicenseModel.delete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "License not found",
      });
    }

    res.json({
      message: "License deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createLicense,
  getAllLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
};