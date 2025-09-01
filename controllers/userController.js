const User = require('../models/User');
const Task = require('../models/Task');
const Api = require('../utils/Api');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    return Api.success(res, {
      user: req.user.getPublicProfile()
    }, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Get user profile error:', error);
    return Api.error(res, 'Failed to get user profile', 500);
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const updates = {};

    if (displayName !== undefined) {
      updates.displayName = displayName;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return Api.success(res, {
      user: user.getPublicProfile()
    }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update user profile error:', error);
    return Api.error(res, 'Failed to update profile', 500);
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return Api.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    return Api.success(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return Api.error(res, 'Failed to change password', 500);
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
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

    // Get tasks created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = await Task.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get completion rate by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: ["$isCompleted", 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return Api.success(res, {
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        recentTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
      },
      dailyStats
    }, 'User statistics retrieved successfully');
  } catch (error) {
    console.error('Get user stats error:', error);
    return Api.error(res, 'Failed to get user statistics', 500);
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return Api.unauthorized(res, 'Password is incorrect');
    }

    // Delete all user's tasks
    await Task.deleteMany({ userId: req.user._id });

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    return Api.success(res, null, 'Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    return Api.error(res, 'Failed to delete account', 500);
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const activity = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          $or: [
            { createdAt: { $gte: startDate } },
            { updatedAt: { $gte: startDate } }
          ]
        }
      },
      {
        $project: {
          action: {
            $cond: {
              if: { $eq: ["$createdAt", "$updatedAt"] },
              then: "created",
              else: "updated"
            }
          },
          date: { $max: ["$createdAt", "$updatedAt"] },
          title: 1
        }
      },
      { $sort: { date: -1 } },
      { $limit: 50 }
    ]);

    return Api.success(res, { activity }, 'User activity retrieved successfully');
  } catch (error) {
    console.error('Get user activity error:', error);
    return Api.error(res, 'Failed to get user activity', 500);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats,
  deleteAccount,
  getUserActivity
};
