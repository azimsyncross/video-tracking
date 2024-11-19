const app = require('./app');
const connectDB = require('./config/dbconfig');
const { port } = require('./config/variables.config');

// Connect to Database
connectDB();

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
