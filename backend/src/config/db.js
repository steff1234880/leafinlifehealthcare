import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using the environment variable MONGODB_URI or MONGO_URI.
 * Includes graceful connection retry and status logging.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI / MONGO_URI environment variable is not defined.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000, // Timeout after 4 seconds if server is not available
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.log('ℹ️  Backend will operate with active memory store until MongoDB daemon or Atlas cluster is reachable.');
    return false;
  }
}

/**
 * Helper to check current database connection status
 */
export function getDbConnectionStatus() {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'Unknown',
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

