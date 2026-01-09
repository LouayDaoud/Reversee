const HabitDNA = require('../models/HabitDNA');
const HabitDNAService = require('../services/habitDNAService');

// @desc    Get or generate user's Habit DNA
// @route   GET /api/habit-dna
// @access  Private
exports.getMyHabitDNA = async (req, res) => {
  try {
    let habitDNA = await HabitDNA.findOne({ user: req.user.id })
      .populate('user', 'username email firstName lastName');

    if (!habitDNA) {
      // Générer le DNA si il n'existe pas
      try {
        habitDNA = await HabitDNAService.generateOrUpdateHabitDNA(req.user.id);
        if (habitDNA) {
          await habitDNA.populate('user', 'username email firstName lastName');
        }
      } catch (genError) {
        console.error('Error generating Habit DNA:', genError);
        // Même en cas d'erreur, créer un DNA par défaut
        habitDNA = await HabitDNAService.generateOrUpdateHabitDNA(req.user.id);
        if (habitDNA) {
          await habitDNA.populate('user', 'username email firstName lastName');
        }
      }
    }

    if (!habitDNA) {
      return res.status(500).json({
        success: false,
        message: 'Impossible de générer le Habit DNA. Veuillez réessayer.'
      });
    }

    res.status(200).json({
      success: true,
      data: habitDNA
    });
  } catch (error) {
    console.error('Error getting Habit DNA:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du Habit DNA'
    });
  }
};

// @desc    Update/Regenerate user's Habit DNA
// @route   PUT /api/habit-dna
// @access  Private
exports.updateHabitDNA = async (req, res) => {
  try {
    const habitDNA = await HabitDNAService.generateOrUpdateHabitDNA(req.user.id);
    await habitDNA.populate('user', 'username email firstName lastName');

    res.status(200).json({
      success: true,
      data: habitDNA,
      message: 'Habit DNA mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating Habit DNA:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du Habit DNA'
    });
  }
};

// @desc    Get compatibility with other users
// @route   GET /api/habit-dna/compatibility/:userId
// @access  Private
exports.getCompatibility = async (req, res) => {
  try {
    const myDNA = await HabitDNA.findOne({ user: req.user.id });
    const otherDNA = await HabitDNA.findOne({ user: req.params.userId });

    if (!myDNA || !otherDNA) {
      return res.status(404).json({
        success: false,
        message: 'Habit DNA non trouvé'
      });
    }

    const compatibility = HabitDNAService.calculateCompatibility(myDNA, otherDNA);

    res.status(200).json({
      success: true,
      data: {
        compatibility: compatibility.score,
        factors: compatibility.factors,
        myDNA: {
          components: myDNA.components,
          colors: myDNA.colors
        },
        otherDNA: {
          components: otherDNA.components,
          colors: otherDNA.colors
        }
      }
    });
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du calcul de compatibilité'
    });
  }
};

// @desc    Toggle public visibility
// @route   PUT /api/habit-dna/visibility
// @access  Private
exports.toggleVisibility = async (req, res) => {
  try {
    const habitDNA = await HabitDNA.findOne({ user: req.user.id });

    if (!habitDNA) {
      return res.status(404).json({
        success: false,
        message: 'Habit DNA non trouvé'
      });
    }

    habitDNA.isPublic = !habitDNA.isPublic;
    await habitDNA.save();

    res.status(200).json({
      success: true,
      data: habitDNA,
      message: habitDNA.isPublic ? 'Habit DNA rendu public' : 'Habit DNA rendu privé'
    });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la modification de la visibilité'
    });
  }
};

// @desc    Get all public Habit DNA (Admin)
// @route   GET /api/admin/habit-dna
// @access  Admin only
exports.getAllHabitDNA = async (req, res) => {
  try {
    const { isPublic, limit = 50 } = req.query;
    
    const query = {};
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const habitDNAs = await HabitDNA.find(query)
      .populate('user', 'username email firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: habitDNAs.length,
      data: habitDNAs
    });
  } catch (error) {
    console.error('Error getting all Habit DNA:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des Habit DNA'
    });
  }
};

// @desc    Get user's Habit DNA by ID (Admin)
// @route   GET /api/admin/habit-dna/:userId
// @access  Admin only
exports.getUserHabitDNA = async (req, res) => {
  try {
    const habitDNA = await HabitDNA.findOne({ user: req.params.userId })
      .populate('user', 'username email firstName lastName');

    if (!habitDNA) {
      return res.status(404).json({
        success: false,
        message: 'Habit DNA non trouvé pour cet utilisateur'
      });
    }

    res.status(200).json({
      success: true,
      data: habitDNA
    });
  } catch (error) {
    console.error('Error getting user Habit DNA:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du Habit DNA'
    });
  }
};

// @desc    Force regenerate Habit DNA for user (Admin)
// @route   POST /api/admin/habit-dna/:userId/regenerate
// @access  Admin only
exports.regenerateHabitDNA = async (req, res) => {
  try {
    const habitDNA = await HabitDNAService.generateOrUpdateHabitDNA(req.params.userId);
    await habitDNA.populate('user', 'username email firstName lastName');

    res.status(200).json({
      success: true,
      data: habitDNA,
      message: 'Habit DNA régénéré avec succès'
    });
  } catch (error) {
    console.error('Error regenerating Habit DNA:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la régénération du Habit DNA'
    });
  }
};

