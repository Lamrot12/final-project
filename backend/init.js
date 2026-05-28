const { initializeDatabase } = require('./src/config/initDatabase');

initializeDatabase()
  .then(() => {
    console.log('Database initialized');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });