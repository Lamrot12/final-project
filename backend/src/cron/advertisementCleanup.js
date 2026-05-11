const AdvertisementModel = require("../models/advertisement.model");

const runAdvertisementCleanup = async () => {
  try {
    const deleted = await AdvertisementModel.deleteExpired();
    console.log(`Expired advertisements removed: ${deleted.length}`);
  } catch (err) {
    console.error("Advertisement cleanup error:", err.message);
  }
};

module.exports = { runAdvertisementCleanup };