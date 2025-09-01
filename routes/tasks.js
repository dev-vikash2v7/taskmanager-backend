const express = require('express');
const { body, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getOverdueTasks,
  getUpcomingTasks,
  getTaskStats,
  bulkUpdateTasks,
  bulkDeleteTasks
} = require('../controllers/taskController');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(auth);

// Validation rules
const createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const getTasksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const bulkUpdateValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('Task IDs must be a non-empty array'),
  body('taskIds.*')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
];

const bulkDeleteValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('Task IDs must be a non-empty array'),
  body('taskIds.*')
    .isMongoId()
    .withMessage('Invalid task ID format')
];

// Routes
router.post('/', createTaskValidation, validate, createTask);
router.get('/', getTasksValidation, validate, getTasks);
router.get('/overdue', getOverdueTasks);
router.get('/upcoming', getUpcomingTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.put('/bulk/update', bulkUpdateValidation, validate, bulkUpdateTasks);
router.delete('/bulk/delete', bulkDeleteValidation, validate, bulkDeleteTasks);

module.exports = router;
