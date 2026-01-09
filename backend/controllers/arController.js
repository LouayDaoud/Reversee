const ARSession = require('../models/ARSession');
const Habit = require('../models/Habit');

// @desc    Create new AR session
// @route   POST /api/ar/sessions
// @access  Private
exports.createARSession = async (req, res) => {
  try {
    const { sessionType, habits, config } = req.body;

    const arSession = await ARSession.create({
      user: req.user.id,
      sessionType: sessionType || 'habit_visualization',
      habits: habits || [],
      config: config || {},
      startedAt: new Date()
    });

    await arSession.populate('habits', 'name category value unit date');

    res.status(201).json({
      success: true,
      data: arSession
    });
  } catch (error) {
    console.error('Error creating AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la session AR'
    });
  }
};

// @desc    Get user's AR sessions
// @route   GET /api/ar/sessions
// @access  Private
exports.getMyARSessions = async (req, res) => {
  try {
    const { sessionType, limit = 20 } = req.query;
    
    const query = { user: req.user.id };
    if (sessionType) {
      query.sessionType = sessionType;
    }

    const sessions = await ARSession.find(query)
      .populate('habits', 'name category value unit')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting AR sessions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des sessions AR'
    });
  }
};

// @desc    Get AR session by ID
// @route   GET /api/ar/sessions/:id
// @access  Private
exports.getARSession = async (req, res) => {
  try {
    const arSession = await ARSession.findById(req.params.id)
      .populate('habits', 'name category value unit date')
      .populate('user', 'username firstName lastName');

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'Session AR non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (arSession.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: arSession
    });
  } catch (error) {
    console.error('Error getting AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la session AR'
    });
  }
};

// @desc    Update AR session (add objects, scan QR, etc.)
// @route   PUT /api/ar/sessions/:id
// @access  Private
exports.updateARSession = async (req, res) => {
  try {
    const { arObjects, scannedQRCodes, stats, endedAt } = req.body;

    const arSession = await ARSession.findById(req.params.id);

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'Session AR non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (arSession.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (arObjects) {
      arSession.arObjects = [...arSession.arObjects, ...arObjects];
    }

    if (scannedQRCodes) {
      arSession.scannedQRCodes = [...arSession.scannedQRCodes, ...scannedQRCodes];
    }

    if (stats) {
      arSession.stats = { ...arSession.stats, ...stats };
    }

    if (endedAt) {
      arSession.endedAt = new Date(endedAt);
      const duration = (new Date(endedAt) - arSession.startedAt) / 1000;
      arSession.stats.duration = duration;
    }

    await arSession.save();

    res.status(200).json({
      success: true,
      data: arSession
    });
  } catch (error) {
    console.error('Error updating AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la session AR'
    });
  }
};

// @desc    Add capture to AR session
// @route   POST /api/ar/sessions/:id/captures
// @access  Private
exports.addCapture = async (req, res) => {
  try {
    const { url, description } = req.body;

    const arSession = await ARSession.findById(req.params.id);

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'Session AR non trouvée'
      });
    }

    if (arSession.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    arSession.captures.push({
      url,
      description,
      timestamp: new Date()
    });

    await arSession.save();

    res.status(200).json({
      success: true,
      data: arSession
    });
  } catch (error) {
    console.error('Error adding capture:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ajout de la capture'
    });
  }
};

// @desc    Toggle share AR session
// @route   PUT /api/ar/sessions/:id/share
// @access  Private
exports.toggleShare = async (req, res) => {
  try {
    const arSession = await ARSession.findById(req.params.id);

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'Session AR non trouvée'
      });
    }

    if (arSession.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    arSession.isShared = !arSession.isShared;
    if (arSession.isShared) {
      arSession.sharedAt = new Date();
    }

    await arSession.save();

    res.status(200).json({
      success: true,
      data: arSession,
      message: arSession.isShared ? 'Session partagée' : 'Partage annulé'
    });
  } catch (error) {
    console.error('Error toggling share:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la modification du partage'
    });
  }
};

// @desc    Get all AR sessions (Admin)
// @route   GET /api/admin/ar/sessions
// @access  Admin only
exports.getAllARSessions = async (req, res) => {
  try {
    const { sessionType, isShared, limit = 50 } = req.query;
    
    const query = {};
    if (sessionType) {
      query.sessionType = sessionType;
    }
    if (isShared !== undefined) {
      query.isShared = isShared === 'true';
    }

    const sessions = await ARSession.find(query)
      .populate('user', 'username email firstName lastName')
      .populate('habits', 'name category')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting all AR sessions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des sessions AR'
    });
  }
};

// @desc    Generate QR code for habit trigger
// @route   POST /api/ar/qr-code
// @access  Private
exports.generateQRCode = async (req, res) => {
  try {
    const { habitId, sessionId } = req.body;

    // Générer un code unique
    const code = `HABIT_${habitId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    res.status(200).json({
      success: true,
      data: {
        code,
        habitId,
        sessionId,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ar/scan/${code}`
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la génération du QR code'
    });
  }
};

