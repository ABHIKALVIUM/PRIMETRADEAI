import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { dbState, getLocalDbData, saveLocalDbData } from '../config/db.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// ✅ FIX: async pre-save hooks must NOT use a callback — just return/await
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

class UserFallbackModel {
  static async findOne(query) {
    const db = getLocalDbData();
    const found = db.users.find(u => u.email === query.email);
    if (!found) return null;

    return {
      ...found,
      comparePassword: async (pass) => await bcrypt.compare(pass, found.password)
    };
  }

  static async findById(id) {
    const db = getLocalDbData();
    const found = db.users.find(u => u._id === id);
    if (!found) return null;
    return { ...found };
  }

  static async create(data) {
    const db = getLocalDbData();

    const existing = db.users.find(u => u.email === data.email.toLowerCase().trim());
    if (existing) {
      const err = new Error('Email already registered. Proceed to Login.');
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveLocalDbData(db);
    return newUser;
  }
}

export const User = new Proxy(MongoUser, {
  get: (target, prop) => {
    if (dbState.isUsingLocalFallback) {
      return UserFallbackModel[prop] || (() => {
        console.warn(`Fallback system route unmapped: ${prop}`);
        return null;
      });
    }
    return target[prop];
  }
});