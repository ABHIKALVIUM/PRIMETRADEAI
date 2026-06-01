import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const LOCAL_DB_PATH = path.resolve(process.cwd(), 'backend', 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_PATH, 'db.json');

if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.mkdirSync(LOCAL_DB_PATH, { recursive: true });
}

if (!fs.existsSync(LOCAL_DB_FILE)) {
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify({ users: [], tasks: [] }, null, 2), 'utf-8');
}

export const getLocalDbData = () => {
  try {
    const data = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], tasks: [] };
  }
};

export const saveLocalDbData = (data) => {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Local transactional backup synchronization failure:', err);
    return false;
  }
};

// ✅ FIX: Export as object so mutations are reflected across all imports
export const dbState = { isUsingLocalFallback: false };

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('⚠️ MONGO_URI is unconfigured. Activating isolated system failover storage database.');
    dbState.isUsingLocalFallback = true;
    return { isFallback: true };
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('🍃 MongoDB Connected Successfully');
    dbState.isUsingLocalFallback = false;
    return conn;
  } catch (error) {
    console.error(`Database connection pipeline critical fault: ${error.message}`);
    process.exit(1);
  }
};