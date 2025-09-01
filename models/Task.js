const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task status
taskSchema.virtual('status').get(function() {
  if (this.isCompleted) return 'completed';
  if (new Date() > this.dueDate) return 'overdue';
  return 'pending';
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to mark task as completed
taskSchema.methods.markAsCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to mark task as incomplete
taskSchema.methods.markAsIncomplete = function() {
  this.isCompleted = false;
  this.completedAt = undefined;
  return this.save();
};

// Static method to get tasks by user
taskSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.isCompleted !== undefined) {
    query.isCompleted = options.isCompleted;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get overdue tasks
taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    userId,
    isCompleted: false,
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Static method to get upcoming tasks
taskSchema.statics.findUpcoming = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    userId,
    isCompleted: false,
    dueDate: { 
      $gte: new Date(),
      $lte: futureDate
    }
  }).sort({ dueDate: 1 });
};

// Indexes for better query performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, isCompleted: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);
