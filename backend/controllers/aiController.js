const AIService = require('../services/aiService');
const AIModel = require('../models/AIModel');
const ChatConversation = require('../models/ChatConversation');

// @desc    Generate AI response
// @route   POST /api/ai/generate
// @access  Private
exports.generateResponse = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Récupérer l'historique de la conversation si conversationId fourni
    let conversationHistory = [];
    if (conversationId) {
      const conversation = await ChatConversation.findById(conversationId);
      if (conversation && conversation.user.toString() === userId) {
        conversationHistory = conversation.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }));
      }
    }

    // Enrichir le contexte automatiquement si non fourni
    let context = req.body.context || {};
    
    // Si le contexte n'est pas fourni ou incomplet, l'enrichir automatiquement
    if (!context.user || !context.habits) {
      const Habit = require('../models/Habit');
      const User = require('../models/User');
      
      const user = await User.findById(userId).select('-password');
      const recentHabits = await Habit.find({ user: userId })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      context = {
        ...context,
        user: context.user || {
          firstName: user?.firstName,
          lastName: user?.lastName,
          isAdmin: user?.isAdmin
        },
        habits: context.habits || recentHabits
      };
    }

    // Générer la réponse IA avec contexte enrichi (OpenAI uniquement)
    let aiResponse;
    try {
      aiResponse = await AIService.generateResponse(
        message,
        userId,
        conversationHistory,
        context
      );
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Retourner une erreur claire si OpenAI n'est pas configuré
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération de la réponse IA. Vérifiez que le modèle ML local est correctement configuré.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        model: await AIModel.findOne({ isActive: true, isDefault: true })
      }
    });
  } catch (error) {
    console.error('Error in generateResponse controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating AI response'
    });
  }
};

// @desc    Get all AI models
// @route   GET /api/ai/models
// @access  Private (Admin only)
exports.getModels = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const models = await AIModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    console.error('Error getting AI models:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get active AI model
// @route   GET /api/ai/model/active
// @access  Private
exports.getActiveModel = async (req, res) => {
  try {
    let activeModel = await AIModel.findOne({ isActive: true, isDefault: true });

    // Si aucun modèle n'existe, créer un modèle par défaut
    if (!activeModel) {
      activeModel = await AIService.createDefaultModel();
    }

    if (!activeModel) {
      return res.status(404).json({
        success: false,
        message: 'No active AI model found'
      });
    }

    // Ne pas exposer les clés API
    const modelData = activeModel.toObject();
    delete modelData.apiEndpoint;
    delete modelData.requiresApiKey;

    res.status(200).json({
      success: true,
      data: modelData
    });
  } catch (error) {
    console.error('Error getting active AI model:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new AI model
// @route   POST /api/ai/models
// @access  Private (Admin only)
exports.createModel = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const {
      name,
      provider,
      modelId,
      description,
      config,
      systemPrompt,
      apiEndpoint,
      isDefault
    } = req.body;

    // Validation
    if (!name || !provider || !modelId) {
      return res.status(400).json({
        success: false,
        message: 'Name, provider, and modelId are required'
      });
    }

    // Si c'est le modèle par défaut, désactiver les autres
    if (isDefault) {
      await AIModel.updateMany(
        { _id: { $ne: null } },
        { isDefault: false }
      );
    }

    const model = await AIModel.create({
      name,
      provider,
      modelId,
      description,
      config: config || {},
      systemPrompt: systemPrompt || '',
      apiEndpoint,
      createdBy: req.user.id,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Error creating AI model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update AI model
// @route   PUT /api/ai/models/:id
// @access  Private (Admin only)
exports.updateModel = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Si on définit comme modèle par défaut, désactiver les autres
    if (updateData.isDefault) {
      await AIModel.updateMany(
        { _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const model = await AIModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    res.status(200).json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Error updating AI model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete AI model
// @route   DELETE /api/ai/models/:id
// @access  Private (Admin only)
exports.deleteModel = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { id } = req.params;

    const model = await AIModel.findById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Ne pas permettre la suppression du modèle par défaut s'il est le seul
    if (model.isDefault) {
      const otherModels = await AIModel.countDocuments({ _id: { $ne: id }, isActive: true });
      if (otherModels === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the default model when it is the only active model'
        });
      }
    }

    await AIModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting AI model:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Test AI model
// @route   POST /api/ai/models/:id/test
// @access  Private (Admin only)
exports.testModel = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Test message is required'
      });
    }

    const model = await AIModel.findById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Générer une réponse de test
    const response = await AIService.generateResponse(
      message,
      req.user.id,
      [],
      {}
    );

    res.status(200).json({
      success: true,
      data: {
        model: model.name,
        testMessage: message,
        response: response
      }
    });
  } catch (error) {
    console.error('Error testing AI model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error testing model'
    });
  }
};

