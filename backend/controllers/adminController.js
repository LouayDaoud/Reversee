const mongoose = require('mongoose');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Category = require('../models/Category');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin only
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user habits
// @route   GET /api/admin/users/:id/habits
// @access  Admin only
exports.getUserHabits = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user habits
    const habits = await Habit.find({ user: req.params.id });

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard stats for admin
// @route   GET /api/admin/stats
// @access  Admin only
exports.getAdminStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total habits
    const totalHabits = await Habit.countDocuments();

    // Get all categories from the database
    let allCategories = await Category.find().sort({ name: 1 });

    // If no categories exist yet in the Category collection, get unique categories from habits
    if (allCategories.length === 0) {
      const uniqueCategories = await Habit.distinct('category');
      allCategories = uniqueCategories.map(category => ({
        _id: category,
        name: category,
        slug: category
      }));
    }

    // Get habits by category
    const habitsByCategoryResult = await Habit.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Habits by category result:', habitsByCategoryResult);

    // Create a complete list of categories with counts (including those with zero habits)
    const habitsByCategory = allCategories.map(category => {
      const categoryId = category.slug || category._id;
      const found = habitsByCategoryResult.find(c => c._id === categoryId);
      return {
        _id: categoryId,
        name: category.name || categoryId,
        count: found ? found.count : 0
      };
    });

    // Get users registered in the last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const newUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Get stats for each user
    const users = await User.find().select('-password');
    const userStats = await Promise.all(
      users.map(async (user) => {
        let habitCount = 0;
        let userHabitsByCategoryResult = [];
        let latestHabit = null;

        try {
          // Convert user._id to ObjectId
          const userId = mongoose.Types.ObjectId(user._id);
          console.log(`Processing user ${user.username} with ID ${userId}`);

          // Get all habits for this user to debug
          const userHabits = await Habit.find({ user: userId });
          console.log(`User ${user.username} has ${userHabits.length} habits found directly`);

          // Get user's habits count
          habitCount = await Habit.countDocuments({ user: userId });
          console.log(`User ${user.username} has ${habitCount} habits from countDocuments`);

          // Get user's habits by category
          userHabitsByCategoryResult = await Habit.aggregate([
            { $match: { user: userId } },
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            }
          ]);

          console.log(`User ${user.username} habits by category:`, userHabitsByCategoryResult);

          // Get user's most recent habit
          latestHabit = await Habit.findOne({ user: userId })
            .sort({ date: -1 })
            .limit(1);
        } catch (err) {
          console.error(`Error processing user ${user.username}:`, err);
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            habitCount: 0,
            habitsByCategory: [],
            lastActivity: user.createdAt,
            error: err.message
          };
        }

        // Create a complete list of categories for this user (including those with zero habits)
        const userHabitsByCategory = allCategories.map(category => {
          const categoryId = category.slug || category._id;
          const found = userHabitsByCategoryResult.find(c => c._id === categoryId);
          return {
            _id: categoryId,
            name: category.name || categoryId,
            count: found ? found.count : 0
          };
        });

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          habitCount,
          habitsByCategory: userHabitsByCategory,
          lastActivity: latestHabit ? latestHabit.date : user.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalHabits,
        habitsByCategory,
        allCategories,
        newUsers,
        userStats
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};