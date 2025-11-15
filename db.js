const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no MONGODB_URI is provided, try to connect to local MongoDB or skip
    if (!mongoUri) {
      // Check if this is a development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log('📦 Using local MongoDB on localhost:27017...');
      }
      mongoUri = 'mongodb://localhost:27017/pet-help-center';
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Tip: Start MongoDB with: docker-compose up -d');
    console.log('💡 Or set MONGODB_URI environment variable');
    console.log('⏭️  Continuing without database - frontend will work but API may be limited');
    return null;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

module.exports = connectDB;