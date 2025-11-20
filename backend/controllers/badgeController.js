const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Habit = require('../models/Habit');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ category: 1, level: 1 });

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (err) {
    console.error('Error getting badges:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user badges
// @route   GET /api/badges/me
// @access  Private
exports.getUserBadges = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user.id })
      .populate('badge')
      .sort({ earnedAt: -1 });

    res.status(200).json({
      success: true,
      count: userBadges.length,
      data: userBadges
    });
  } catch (err) {
    console.error('Error getting user badges:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mark badge as viewed
// @route   PUT /api/badges/:id/view
// @access  Private
exports.markBadgeAsViewed = async (req, res) => {
  try {
    const userBadge = await UserBadge.findById(req.params.id);

    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if the badge belongs to the user
    if (userBadge.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this badge'
      });
    }

    userBadge.isViewed = true;
    await userBadge.save();

    res.status(200).json({
      success: true,
      data: userBadge
    });
  } catch (err) {
    console.error('Error marking badge as viewed:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create a badge (Admin only)
// @route   POST /api/badges
// @access  Private/Admin
exports.createBadge = async (req, res) => {
  try {
    const badge = await Badge.create(req.body);

    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (err) {
    console.error('Error creating badge:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update a badge (Admin only)
// @route   PUT /api/badges/:id
// @access  Private/Admin
exports.updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (err) {
    console.error('Error updating badge:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete a badge (Admin only)
// @route   DELETE /api/badges/:id
// @access  Private/Admin
exports.deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Instead of deleting, mark as inactive
    badge.isActive = false;
    await badge.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting badge:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Manually assign a badge to a user (Admin only)
// @route   POST /api/badges/:id/assign
// @access  Private/Admin
exports.assignBadgeToUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if badge exists
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has this badge
    const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (existingUserBadge && existingUserBadge.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Create or update user badge
    let userBadge;
    if (existingUserBadge) {
      existingUserBadge.isCompleted = true;
      existingUserBadge.progress = 100;
      existingUserBadge.earnedAt = Date.now();
      userBadge = await existingUserBadge.save();
    } else {
      userBadge = await UserBadge.create({
        user: userId,
        badge: badge._id,
        isCompleted: true,
        progress: 100
      });
    }

    // Create notification for the user
    await Notification.create({
      user: userId,
      title: 'Nouveau badge débloqué !',
      message: `Félicitations ! Un administrateur vous a attribué le badge "${badge.name}": ${badge.description}`,
      type: 'success',
      isGlobal: false,
      link: '/dashboard'
    });

    res.status(200).json({
      success: true,
      data: userBadge
    });
  } catch (err) {
    console.error('Error assigning badge:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Check and award badges for a user
// @route   POST /api/badges/check
// @access  Private
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all active badges
    const badges = await Badge.find({ isActive: true });

    // Get user's habits
    const habits = await Habit.find({ user: userId });

    // Get user's existing badges
    const existingUserBadges = await UserBadge.find({ user: userId }).populate('badge');
    const existingBadgeIds = existingUserBadges.map(ub => ub.badge._id.toString());

    // Calculate user stats
    const habitCount = habits.length;
    const categoryCounts = {};
    let maxStreak = 0;

    habits.forEach(habit => {
      // Count habits by category
      if (categoryCounts[habit.category]) {
        categoryCounts[habit.category]++;
      } else {
        categoryCounts[habit.category] = 1;
      }

      // Track max streak
      if (habit.streak > maxStreak) {
        maxStreak = habit.streak;
      }
    });

    // Calculate days active (days since registration)
    const daysActive = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

    // Check each badge criteria
    const newlyEarnedBadges = [];

    for (const badge of badges) {
      // Skip if user already has this badge
      if (existingBadgeIds.includes(badge._id.toString())) {
        continue;
      }

      let isEarned = false;
      let progress = 0;

      switch (badge.criteria.type) {
        case 'habit_count':
          progress = Math.min(100, (habitCount / badge.criteria.value) * 100);
          isEarned = habitCount >= badge.criteria.value;
          break;

        case 'streak':
          progress = Math.min(100, (maxStreak / badge.criteria.value) * 100);
          isEarned = maxStreak >= badge.criteria.value;
          break;

        case 'category_count':
          const categoryCount = categoryCounts[badge.criteria.category] || 0;
          progress = Math.min(100, (categoryCount / badge.criteria.value) * 100);
          isEarned = categoryCount >= badge.criteria.value;
          break;

        case 'days_active':
          progress = Math.min(100, (daysActive / badge.criteria.value) * 100);
          isEarned = daysActive >= badge.criteria.value;
          break;

        // Custom criteria would be handled case by case
        case 'custom':
          break;
      }

      // Create user badge with progress
      const userBadge = new UserBadge({
        user: userId,
        badge: badge._id,
        progress,
        isCompleted: isEarned
      });

      // If badge is earned, save it and create notification
      if (isEarned) {
        await userBadge.save();
        newlyEarnedBadges.push(badge);

        // Create notification for the earned badge
        await Notification.create({
          user: userId,
          title: 'Nouveau badge débloqué !',
          message: `Félicitations ! Vous avez débloqué le badge "${badge.name}": ${badge.description}`,
          type: 'success',
          isGlobal: false,
          link: '/dashboard'
        });
      } else if (progress > 0) {
        // Save progress even if badge is not yet earned
        await userBadge.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        newBadges: newlyEarnedBadges,
        totalBadges: existingUserBadges.length + newlyEarnedBadges.length
      }
    });
  } catch (err) {
    console.error('Error checking badges:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
