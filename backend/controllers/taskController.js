import { Task } from '../models/Task.js';
import { ApiError } from '../utils/errorHandler.js';
import { asyncHandler } from '../middlewares/errorMiddleware.js';
import { redisClient } from '../config/redis.js';

// Helper to generate distinct cache key based on user and filtering details
const getTasksCacheKey = (userId, role, queryParams) => {
  const queryStr = JSON.stringify(queryParams);
  return `tasks:${role}:${userId}:${queryStr}`;
};

// @desc    Retrieve all tasks (Admins fetch all, Users fetch only their owned tasks)
// @route   GET /api/v1/tasks
// @access  Protected
export const getTasks = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const userRole = req.user.role;
  const { status, priority, page = 1, limit = 10 } = req.query;

  // Check cache layers first
  const cacheKey = getTasksCacheKey(userId, userRole, { status, priority, page, limit });
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log('⚡ Cache HIT: Serving tasks database queries from Redis.');
    return res.status(200).json(JSON.parse(cachedData));
  }

  console.log('🔌 Cache MISS: Executing database fetch for tasks.');

  // Build MongoDB structural filter query mapping
  const query = {};
  if (userRole !== 'admin') {
    query.createdBy = userId;
  }
  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }

  // Fetch collections records out of active storage layer
  let tasks = await Task.find(query);

  // Apply sequential layout formatting parameters
  const totalTasks = tasks.length;
  const startIndex = (page - 1) * limit;
  const paginatedTasks = tasks.slice(startIndex, startIndex + parseInt(limit));

  const responseBody = {
    success: true,
    count: paginatedTasks.length,
    pagination: {
      total: totalTasks,
      page: parseInt(page),
      pages: Math.ceil(totalTasks / limit),
      limit: parseInt(limit)
    },
    data: {
      tasks: paginatedTasks
    }
  };

  // Sync transactional states to caching maps
  await redisClient.set(cacheKey, JSON.stringify(responseBody), 60);

  res.status(200).json(responseBody);
});

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Protected
export const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status, priority } = req.body;
  const userId = req.user._id || req.user.id;

  const task = await Task.create({
    title,
    description,
    status: status || 'pending',
    priority: priority || 'medium',
    createdBy: userId
  });

  // Safe cache invalidation
  const userRole = req.user.role;
  const cacheKeyPattern = getTasksCacheKey(userId, userRole, {});
  await redisClient.del(cacheKeyPattern);

  res.status(201).json({
    success: true,
    data: {
      task
    }
  });
});

// @desc    Update a task (Owner or Admin only)
// @route   PUT /api/v1/tasks/:id
// @access  Protected
export const updateTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const { title, description, status, priority } = req.body;
  const userId = req.user._id || req.user.id;

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // Cast variables explicitly to primitive strings to prevent strict reference type comparison faults
  const taskCreatorId = task.createdBy ? task.createdBy.toString() : '';
  const currentUserId = userId ? userId.toString() : '';

  if (taskCreatorId !== currentUserId && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Permission denied. You can only update your own tasks.'));
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, {
    title: title !== undefined ? title : task.title,
    description: description !== undefined ? description : task.description,
    status: status !== undefined ? status : task.status,
    priority: priority !== undefined ? priority : task.priority,
  }, { new: true, runValidators: true });

  await redisClient.clear();

  res.status(200).json({
    success: true,
    data: {
      task: updatedTask
    }
  });
});

// @desc    Delete a task (Owner or Admin only)
// @route   DELETE /api/v1/tasks/:id
// @access  Protected
export const deleteTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user._id || req.user.id;

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // Cast variables explicitly to primitive strings to prevent strict reference type comparison faults
  const taskCreatorId = task.createdBy ? task.createdBy.toString() : '';
  const currentUserId = userId ? userId.toString() : '';

  if (taskCreatorId !== currentUserId && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Permission denied. You can only delete your own tasks.'));
  }

  await Task.findByIdAndDelete(taskId);
  await redisClient.clear();

  res.status(200).json({
    success: true,
    message: 'Task successfully removed'
  });
});