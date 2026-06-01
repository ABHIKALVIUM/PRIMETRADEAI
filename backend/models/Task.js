  import mongoose from 'mongoose';
  import { dbState, getLocalDbData, saveLocalDbData } from '../config/db.js';

  const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  }, { timestamps: true });

  const MongoTask = mongoose.models.Task || mongoose.model('Task', TaskSchema);

  class TaskFallbackModel {
    static async find(query = {}) {
      const db = getLocalDbData();
      let results = [...db.tasks];

      if (query.createdBy) {
        results = results.filter(t => t.createdBy.toString() === query.createdBy.toString());
      }
      if (query.status) {
        results = results.filter(t => t.status === query.status);
      }
      if (query.priority) {
        results = results.filter(t => t.priority === query.priority);
      }
      return results;
    }

    static async findById(id) {
      const db = getLocalDbData();
      const task = db.tasks.find(t => t._id === id);
      if (!task) return null;
      return {
        ...task,
        createdBy: { equals: (idCompare) => task.createdBy.toString() === idCompare.toString() }
      };
    }

    static async create(data) {
      const db = getLocalDbData();
      const newTask = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: data.title,
        description: data.description,
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        createdBy: data.createdBy.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.tasks.push(newTask);
      saveLocalDbData(db);
      return newTask;
    }

    static async findByIdAndUpdate(id, update) {
      const db = getLocalDbData();
      const index = db.tasks.findIndex(t => t._id === id);
      if (index === -1) return null;

      db.tasks[index] = { ...db.tasks[index], ...update, updatedAt: new Date().toISOString() };
      saveLocalDbData(db);
      return db.tasks[index];
    }

    static async findByIdAndDelete(id) {
      const db = getLocalDbData();
      const index = db.tasks.findIndex(t => t._id === id);
      if (index === -1) return null;
      db.tasks.splice(index, 1);
      saveLocalDbData(db);
      return true;
    }
  }

  // ✅ FIX: Use dbState.isUsingLocalFallback (live reference, not stale imported value)
  export const Task = new Proxy(MongoTask, {
    get: (target, prop) => {
      if (dbState.isUsingLocalFallback) {
        return TaskFallbackModel[prop] || (() => { console.warn(`Fallback database target exception: ${prop}`); return null; });
      }
      return target[prop];
    }
  });