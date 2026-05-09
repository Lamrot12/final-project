process.env.PORT = 5001;

const { initializeDatabase } = require('./src/config/initDatabase');

// Initialize database then start server
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    require('./src/index.js');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
