const Habit = require('../models/Habit');

// @desc    Get habit statistics
// @route   GET /api/stats
// @access  Private
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all habits for the user
    const habits = await Habit.find({ user: userId });
    
    // If no habits, return empty stats
    if (!habits.length) {
      return res.status(200).json({
        success: true,
        data: {
          habitCounts: {},
          completionRate: 0,
          streakStats: { current: 0, longest: 0 },
          categoryDistribution: {},
          weeklyTrends: [],
          recentActivity: []
        }
      });
    }

    // Category distribution
    const categoryDistribution = {};
    habits.forEach(habit => {
      if (categoryDistribution[habit.category]) {
        categoryDistribution[habit.category]++;
      } else {
        categoryDistribution[habit.category] = 1;
      }
    });

    // Initialize weekly trends
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    // Initialize array for each day of the week
    const weeklyTrends = Array(7).fill().map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        completedCount: 0,
        totalCount: 0
      };
    }).reverse();
    
    // For this simplified version, we'll use the habit's creation date
    habits.forEach(habit => {
      const habitDate = new Date(habit.date);
      if (habitDate >= oneWeekAgo && habitDate <= now) {
        const dayIndex = weeklyTrends.findIndex(day => 
          day.date === habitDate.toISOString().split('T')[0]
        );
        if (dayIndex >= 0) {
          weeklyTrends[dayIndex].totalCount++;
          // For simplicity, we'll consider all habits "completed"
          weeklyTrends[dayIndex].completedCount++;
        }
      }
    });

    // Recent activity - all habits sorted by date
    const recentActivity = habits.map(habit => ({
      habitName: habit.name,
      category: habit.category,
      date: habit.date,
      completed: true, // For simplicity
      value: habit.value
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

    // Habit counts
    const habitCounts = {
      total: habits.length,
      byCategory: categoryDistribution
    };

    // Return all stats
    res.status(200).json({
      success: true,
      data: {
        habitCounts,
        completionRate: 100, // For simplicity
        streakStats: {
          current: Math.min(habits.length, 7), // Simplified
          longest: Math.min(habits.length, 30) // Simplified
        },
        categoryDistribution,
        weeklyTrends,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get habit productivity score
// @route   GET /api/stats/productivity
// @access  Private
exports.getProductivityScore = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all habits for the user
    const habits = await Habit.find({ user: userId });
    
    if (!habits.length) {
      return res.status(200).json({
        success: true,
        data: {
          score: 0,
          level: 'Beginner',
          nextLevel: 'Consistent',
          pointsToNextLevel: 100
        }
      });
    }

    // Simplified scoring based on number of habits
    const habitCount = habits.length;
    
    // Completion score based on number of habits (max 40)
    const completionScore = Math.min(habitCount * 5, 40);
    
    // Streak score based on recency of habits
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const recentHabits = habits.filter(habit => new Date(habit.date) >= oneMonthAgo);
    const streakScore = Math.min(recentHabits.length * 3, 30);
    
    // Consistency score based on habit distribution over time
    const daysWithHabits = new Set(habits.map(habit => 
      new Date(habit.date).toISOString().split('T')[0]
    )).size;
    const consistencyScore = Math.min(daysWithHabits * 3, 20);
    
    // Variety score based on unique categories
    const categories = new Set(habits.map(habit => habit.category));
    const varietyScore = Math.min(categories.size * 2, 10);
    
    // Total score
    const totalScore = completionScore + streakScore + consistencyScore + varietyScore;
    
    // Determine level
    let level = 'Beginner';
    let nextLevel = 'Consistent';
    let pointsToNextLevel = 30 - totalScore;
    
    if (totalScore >= 30) {
      level = 'Consistent';
      nextLevel = 'Dedicated';
      pointsToNextLevel = 60 - totalScore;
    }
    
    if (totalScore >= 60) {
      level = 'Dedicated';
      nextLevel = 'Expert';
      pointsToNextLevel = 80 - totalScore;
    }
    
    if (totalScore >= 80) {
      level = 'Expert';
      nextLevel = 'Master';
      pointsToNextLevel = 95 - totalScore;
    }
    
    if (totalScore >= 95) {
      level = 'Master';
      nextLevel = null;
      pointsToNextLevel = 0;
    }
    
    res.status(200).json({
      success: true,
      data: {
        score: totalScore,
        components: {
          completion: completionScore,
          streak: streakScore,
          consistency: consistencyScore,
          variety: varietyScore
        },
        level,
        nextLevel,
        pointsToNextLevel: Math.max(0, pointsToNextLevel)
      }
    });
  } catch (error) {
    console.error('Error calculating productivity score:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get mood and stress insights (if tracked)
// @route   GET /api/stats/insights
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all mood and stress habits
    const moodHabits = await Habit.find({ 
      user: userId,
      category: { $in: ['mood', 'stress'] }
    });
    
    if (!moodHabits.length) {
      return res.status(200).json({
        success: true,
        data: {
          hasMoodData: false,
          insights: []
        }
      });
    }
    
    // Process habits for insights
    const insights = [];
    
    // Example insight: Detect mood patterns
    const moodValues = moodHabits
      .filter(habit => habit.category === 'mood')
      .map(habit => habit.value);
    
    if (moodValues.length > 0) {
      const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
      
      if (avgMood < 3) {
        insights.push({
          type: 'mood',
          severity: 'warning',
          message: 'Your mood has been below average lately. Consider activities that boost your wellbeing.'
        });
      } else if (avgMood > 7) {
        insights.push({
          type: 'mood',
          severity: 'positive',
          message: 'Your mood has been very positive recently. Keep up the good work!'
        });
      }
    }
    
    // Example insight: Detect stress patterns
    const stressValues = moodHabits
      .filter(habit => habit.category === 'stress')
      .map(habit => habit.value);
    
    if (stressValues.length > 0) {
      const avgStress = stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length;
      
      if (avgStress > 7) {
        insights.push({
          type: 'stress',
          severity: 'warning',
          message: 'Your stress levels have been high lately. Consider stress reduction techniques.'
        });
      } else if (avgStress < 3) {
        insights.push({
          type: 'stress',
          severity: 'positive',
          message: 'Your stress levels have been very low. Your stress management is working well!'
        });
      }
    }
    
    // Return insights
    res.status(200).json({
      success: true,
      data: {
        hasMoodData: true,
        insights
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 