const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(` - MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` - MongoDB Connection Error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000); // Retry after 5 seconds
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
