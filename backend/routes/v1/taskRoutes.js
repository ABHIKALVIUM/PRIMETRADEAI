import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../../controllers/taskController.js';
import { protect } from '../../middlewares/authMiddleware.js';
import { validateTaskPayload } from '../../middlewares/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validateTaskPayload, createTask);
router.put('/:id', validateTaskPayload, updateTask);
router.delete('/:id', deleteTask);

export default router;