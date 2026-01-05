import mongoose from 'mongoose';

interface ConnectionState {
  isConnected?: boolean;
}

const connection: ConnectionState = {};

export async function dbConnect(): Promise<void> {
  // If we're already connected, return
  if (connection.isConnected) {
    return;
  }

  // If we have a cached connection, use it
  if (mongoose.connections[0].readyState) {
    connection.isConnected = mongoose.connections[0].readyState === 1;
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const db = await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export async function dbDisconnect(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = false;
    console.log('📀 MongoDB disconnected');
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  connection.isConnected = false;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
