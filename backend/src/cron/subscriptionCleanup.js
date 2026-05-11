const { SubscriptionModel } = require("../models/subscription.model");

const runSubscriptionCleanup = async () => {
  try {
    const deleted = await SubscriptionModel.deleteExpired();
    console.log(`Expired subscriptions removed: ${deleted.length}`);
  } catch (err) {
    console.error("Subscription cleanup error:", err.message);
  }
};

module.exports = { runSubscriptionCleanup };