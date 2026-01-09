const ScheduledHabit = require('../models/ScheduledHabit');
const Habit = require('../models/Habit');
const User = require('../models/User');

// @desc    Assign a scheduled habit to a user (Admin only)
// @route   POST /api/admin/scheduled-habits
// @access  Admin only
exports.assignScheduledHabit = async (req, res) => {
  try {
    const {
      userId,
      category,
      name,
      targetValue,
      unit,
      recurrence,
      daysOfWeek,
      startDate,
      endDate,
      preferredTime,
      instructions,
      autoCreate
    } = req.body;

    // Validation
    if (!userId || !category || !name || !targetValue || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, category, name, targetValue, and unit'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Créer l'habitude planifiée
    const scheduledHabit = await ScheduledHabit.create({
      user: userId,
      assignedBy: req.user.id,
      category,
      name,
      targetValue,
      unit,
      recurrence: recurrence || 'daily',
      daysOfWeek: daysOfWeek || [],
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      preferredTime: preferredTime || null,
      instructions: instructions || '',
      autoCreate: autoCreate !== undefined ? autoCreate : true,
      status: 'active'
    });

    // Si autoCreate est activé, créer l'habitude pour aujourd'hui si applicable
    if (scheduledHabit.autoCreate) {
      await createHabitFromSchedule(scheduledHabit);
    }

    res.status(201).json({
      success: true,
      data: scheduledHabit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all scheduled habits for a user (Admin view)
// @route   GET /api/admin/scheduled-habits
// @access  Admin only
exports.getAllScheduledHabits = async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    const query = {};
    if (userId) {
      query.user = userId;
    }
    if (status) {
      query.status = status;
    }

    const scheduledHabits = await ScheduledHabit.find(query)
      .populate('user', 'username email firstName lastName')
      .populate('assignedBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scheduledHabits.length,
      data: scheduledHabits
    });
  } catch (error) {
    console.error('Error in getAllScheduledHabits:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des habitudes planifiées'
    });
  }
};

// @desc    Get scheduled habit by ID
// @route   GET /api/admin/scheduled-habits/:id
// @access  Admin only
exports.getScheduledHabitById = async (req, res) => {
  try {
    const scheduledHabit = await ScheduledHabit.findById(req.params.id)
      .populate('user', 'username email firstName lastName')
      .populate('assignedBy', 'username email')
      .populate('createdHabits');

    if (!scheduledHabit) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled habit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scheduledHabit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update scheduled habit
// @route   PUT /api/admin/scheduled-habits/:id
// @access  Admin only
exports.updateScheduledHabit = async (req, res) => {
  try {
    const scheduledHabit = await ScheduledHabit.findById(req.params.id);

    if (!scheduledHabit) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled habit not found'
      });
    }

    // Mettre à jour les champs fournis
    const updatedFields = req.body;
    Object.keys(updatedFields).forEach(key => {
      if (key === 'startDate' || key === 'endDate') {
        scheduledHabit[key] = updatedFields[key] ? new Date(updatedFields[key]) : null;
      } else if (key !== 'user' && key !== 'assignedBy') {
        scheduledHabit[key] = updatedFields[key];
      }
    });

    await scheduledHabit.save();

    res.status(200).json({
      success: true,
      data: scheduledHabit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete scheduled habit
// @route   DELETE /api/admin/scheduled-habits/:id
// @access  Admin only
exports.deleteScheduledHabit = async (req, res) => {
  try {
    const scheduledHabit = await ScheduledHabit.findById(req.params.id);

    if (!scheduledHabit) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled habit not found'
      });
    }

    await scheduledHabit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Scheduled habit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's scheduled habits (User view)
// @route   GET /api/scheduled-habits
// @access  Private
exports.getMyScheduledHabits = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Par défaut, seulement les actives
    }

    // Filtrer par date si fourni
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    const scheduledHabits = await ScheduledHabit.find(query)
      .populate('assignedBy', 'username firstName lastName')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: scheduledHabits.length,
      data: scheduledHabits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get scheduled habits for calendar view
// @route   GET /api/scheduled-habits/calendar
// @access  Private
exports.getScheduledHabitsForCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // S'assurer que les dates sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Récupérer toutes les habitudes planifiées actives de l'utilisateur
    const scheduledHabits = await ScheduledHabit.find({
      user: req.user.id,
      status: 'active',
      $or: [
        { endDate: null },
        { endDate: { $gte: start } }
      ],
      startDate: { $lte: end }
    }).populate('assignedBy', 'username firstName lastName');

    // Générer les dates pour chaque habitude planifiée
    const calendarEvents = [];
    
    scheduledHabits.forEach(scheduledHabit => {
      const dates = generateDatesFromSchedule(scheduledHabit, start, end);
      
      dates.forEach(date => {
        calendarEvents.push({
          id: scheduledHabit._id,
          scheduledHabitId: scheduledHabit._id,
          title: scheduledHabit.name,
          category: scheduledHabit.category,
          targetValue: scheduledHabit.targetValue,
          unit: scheduledHabit.unit,
          date: date,
          preferredTime: scheduledHabit.preferredTime,
          instructions: scheduledHabit.instructions,
          assignedBy: scheduledHabit.assignedBy,
          isCompleted: false // Vérifier si une habitude existe pour cette date
        });
      });
    });

    // Vérifier quelles habitudes sont déjà complétées
    const habitDates = await Habit.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    }).select('date name');

    calendarEvents.forEach(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      const completed = habitDates.some(habit => {
        const habitDate = new Date(habit.date);
        habitDate.setHours(0, 0, 0, 0);
        return habitDate.getTime() === eventDate.getTime() && 
               habit.name === event.title;
      });
      
      event.isCompleted = completed;
    });

    res.status(200).json({
      success: true,
      count: calendarEvents.length,
      data: calendarEvents
    });
  } catch (error) {
    console.error('Error in getScheduledHabitsForCalendar:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du calendrier'
    });
  }
};

// Helper function: Generate dates from scheduled habit
function generateDatesFromSchedule(scheduledHabit, startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const scheduleStart = new Date(scheduledHabit.startDate);
  const scheduleEnd = scheduledHabit.endDate ? new Date(scheduledHabit.endDate) : null;

  // Déterminer la date de début effective
  const effectiveStart = scheduleStart > start ? scheduleStart : start;
  
  // Si endDate existe et est avant la date de début, retourner vide
  if (scheduleEnd && scheduleEnd < effectiveStart) {
    return dates;
  }

  const currentDate = new Date(effectiveStart);
  currentDate.setHours(0, 0, 0, 0);

  const effectiveEnd = scheduleEnd && scheduleEnd < end ? scheduleEnd : end;

  while (currentDate <= effectiveEnd) {
    let shouldInclude = false;

    if (scheduledHabit.recurrence === 'daily') {
      shouldInclude = true;
    } else if (scheduledHabit.recurrence === 'weekly') {
      const dayOfWeek = currentDate.getDay();
      shouldInclude = scheduledHabit.daysOfWeek.includes(dayOfWeek);
    } else if (scheduledHabit.recurrence === 'custom') {
      // Pour custom, on inclut tous les jours (peut être étendu)
      shouldInclude = true;
    }

    if (shouldInclude) {
      dates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Helper function: Create habit from scheduled habit for today
async function createHabitFromSchedule(scheduledHabit) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier si l'habitude doit être créée aujourd'hui
    const shouldCreate = shouldCreateHabitToday(scheduledHabit, today);
    
    if (!shouldCreate) {
      return null;
    }

    // Vérifier si l'habitude existe déjà pour aujourd'hui
    const existingHabit = await Habit.findOne({
      user: scheduledHabit.user,
      name: scheduledHabit.name,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    if (existingHabit) {
      return existingHabit;
    }

    // Créer l'habitude
    const habit = await Habit.create({
      user: scheduledHabit.user,
      category: scheduledHabit.category,
      name: scheduledHabit.name,
      value: 0, // Valeur initiale à 0, l'utilisateur la complétera
      unit: scheduledHabit.unit,
      date: today,
      notes: scheduledHabit.instructions || ''
    });

    // Ajouter à la liste des habitudes créées
    scheduledHabit.createdHabits.push(habit._id);
    await scheduledHabit.save();

    return habit;
  } catch (error) {
    console.error('Error creating habit from schedule:', error);
    return null;
  }
}

// Helper function: Check if habit should be created today
function shouldCreateHabitToday(scheduledHabit, today) {
  const scheduleStart = new Date(scheduledHabit.startDate);
  scheduleStart.setHours(0, 0, 0, 0);

  if (today < scheduleStart) {
    return false;
  }

  if (scheduledHabit.endDate) {
    const scheduleEnd = new Date(scheduledHabit.endDate);
    scheduleEnd.setHours(23, 59, 59, 999);
    if (today > scheduleEnd) {
      return false;
    }
  }

  if (scheduledHabit.status !== 'active') {
    return false;
  }

  if (scheduledHabit.recurrence === 'daily') {
    return true;
  } else if (scheduledHabit.recurrence === 'weekly') {
    const dayOfWeek = today.getDay();
    return scheduledHabit.daysOfWeek.includes(dayOfWeek);
  }

  return false;
}

