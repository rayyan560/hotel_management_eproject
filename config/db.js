const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  // Check if MONGO_URI contains placeholder <db_password>
  if (!uri || uri.includes('<db_password>')) {
    console.warn(`[Database Warning] MONGO_URI in .env contains '<db_password>'. Please update .env with your real MongoDB Atlas password.`);
    console.log(`[Database Info] Attempting fallback to local MongoDB instance...`);
    uri = 'mongodb://127.0.0.1:27017/luxurystay_db';
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[Database Warning] Could not connect to primary MongoDB (${primaryErr.message}).`);
    
    // If primary failed and was Atlas, try local fallback
    if (uri !== 'mongodb://127.0.0.1:27017/luxurystay_db') {
      try {
        console.log(`[Database Info] Trying local MongoDB fallback (mongodb://127.0.0.1:27017/luxurystay_db)...`);
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/luxurystay_db', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Local MongoDB Connected: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.warn(`[Database Warning] Local MongoDB fallback also unavailable.`);
      }
    }

    // Disable buffering so pending queries fail quickly with a clean error message instead of hanging for 10 seconds
    mongoose.set('bufferCommands', false);
    console.warn(`[Database Info] Please replace <db_password> in .env or start MongoDB locally for database persistence.`);
    return null;
  }
};

module.exports = connectDB;

