const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase } = require('./config/initDatabase');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const pharmacyRegistrationRoutes = require('./routes/pharmacyRegistrationRoutes');
const advertisementPlanRoutes = require('./routes/advertisementPlan.routes')
const advertisementRoutes = require('./routes/advertisement.routes')
const userRoutes = require('./routes/user.routes')
const subscriptionPlanRoutes = require('./routes/subscriptionPlan.routes');
const subscriptionRoutes = require("./routes/subscription.routes");
const { runSubscriptionCleanup } = require("./cron/subscriptionCleanup");
const { runAdvertisementCleanup } = require("./cron/advertisementCleanup");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/pharmacy-registration', pharmacyRegistrationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use("/api/advertisement-plans", advertisementPlanRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PharmaLink API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Initialize database then start server
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    runSubscriptionCleanup();
     setInterval(runSubscriptionCleanup, 60 * 60 * 1000);
     runAdvertisementCleanup();

setInterval(runAdvertisementCleanup, 60 * 60 * 1000);
    app.listen(PORT, () => {
      console.log(`PharmaLink API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;
