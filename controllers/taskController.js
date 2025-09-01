const Task = require('../models/Task');
const Api = require('../utils/Api');

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, tags, notes } = req.body;
    
    const task = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      category,
      tags,
      notes,
      userId: req.user._id
    });

    await task.save();

    return Api.created(res, { task }, 'Task created successfully');
  } catch (error) {
    console.error('Create task error:', error);
    return Api.error(res, 'Failed to create task', 500);
  }
};

// Get all tasks for user
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isCompleted, 
      priority, 
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
      priority,
      category,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const tasks = await Task.findByUser(req.user._id, options);
    const totalTasks = await Task.countDocuments({ userId: req.user._id });

    return Api.success(res, {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTasks,
        pages: Math.ceil(totalTasks / parseInt(limit))
      }
    }, 'Tasks retrieved successfully');
  } catch (error) {
    console.error('Get tasks error:', error);
    return Api.error(res, 'Failed to get tasks', 500);
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return Api.notFound(res, 'Task not found');
    }

    return Api.success(res, { task }, 'Task retrieved successfully');
  } catch (error) {
    console.error('Get task by ID error:', error);
    return Api.error(res, 'Failed to get task', 500);
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, isCompleted, category, tags, notes } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (dueDate !== undefined) updates.dueDate = new Date(dueDate);
    if (priority !== undefined) updates.priority = priority;
    if (isCompleted !== undefined) {
      updates.isCompleted = isCompleted;
      updates.completedAt = isCompleted ? new Date() : undefined;
    }
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return Api.notFound(res, 'Task not found');
    }

    return Api.success(res, { task }, 'Task updated successfully');
  } catch (error) {
    console.error('Update task error:', error);
    return Api.error(res, 'Failed to update task', 500);
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return Api.notFound(res, 'Task not found');
    }

    return Api.success(res, null, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    return Api.error(res, 'Failed to delete task', 500);
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return Api.notFound(res, 'Task not found');
    }

    if (task.isCompleted) {
      await task.markAsIncomplete();
    } else {
      await task.markAsCompleted();
    }

    return Api.success(res, { task }, 'Task completion toggled successfully');
  } catch (error) {
    console.error('Toggle task completion error:', error);
    return Api.error(res, 'Failed to toggle task completion', 500);
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.findOverdue(req.user._id);
    
    return Api.success(res, { tasks }, 'Overdue tasks retrieved successfully');
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    return Api.error(res, 'Failed to get overdue tasks', 500);
  }
};

// Get upcoming tasks
const getUpcomingTasks = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const tasks = await Task.findUpcoming(req.user._id, parseInt(days));
    
    return Api.success(res, { tasks }, 'Upcoming tasks retrieved successfully');
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    return Api.error(res, 'Failed to get upcoming tasks', 500);
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.user._id });
    const completedTasks = await Task.countDocuments({ 
      userId: req.user._id, 
      isCompleted: true 
    });
    const pendingTasks = await Task.countDocuments({ 
      userId: req.user._id, 
      isCompleted: false 
    });
    const overdueTasks = await Task.countDocuments({
      userId: req.user._id,
      isCompleted: false,
      dueDate: { $lt: new Date() }
    });

    const priorityStats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { userId: req.user._id, category: { $exists: true, $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return Api.success(res, {
      stats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
      },
      priorityStats,
      categoryStats
    }, 'Task statistics retrieved successfully');
  } catch (error) {
    console.error('Get task stats error:', error);
    return Api.error(res, 'Failed to get task statistics', 500);
  }
};

// Bulk operations
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return Api.badRequest(res, 'Task IDs are required');
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user._id },
      updates
    );

    return Api.success(res, { 
      modifiedCount: result.modifiedCount 
    }, `${result.modifiedCount} tasks updated successfully`);
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    return Api.error(res, 'Failed to bulk update tasks', 500);
  }
};

const bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return Api.badRequest(res, 'Task IDs are required');
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      userId: req.user._id
    });

    return Api.success(res, { 
      deletedCount: result.deletedCount 
    }, `${result.deletedCount} tasks deleted successfully`);
  } catch (error) {
    console.error('Bulk delete tasks error:', error);
    return Api.error(res, 'Failed to bulk delete tasks', 500);
  }
};

module.exports = {
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
};
