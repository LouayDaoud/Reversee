const HabitAnalysisService = require('../services/habitAnalysisService');
const AIService = require('../services/aiService');
const Habit = require('../models/Habit');

// @desc    Get habit analysis for user
// @route   GET /api/analysis/habits
// @access  Private
exports.getHabitAnalysis = async (req, res) => {
  try {
    const analysis = await HabitAnalysisService.analyzeUserHabits(req.user.id);
    
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    console.error('Error getting habit analysis:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get AI-powered habit insights
// @route   GET /api/analysis/ai-insights
// @access  Private
exports.getAIInsights = async (req, res) => {
  try {
    // Obtenir l'analyse des habitudes
    const analysis = await HabitAnalysisService.analyzeUserHabits(req.user.id);
    const userHabits = await Habit.find({ user: req.user.id });
    
    // Générer le prompt pour l'IA
    const prompt = HabitAnalysisService.generateAIPrompt(analysis, userHabits);
    
    // Utiliser le service IA unifié (OpenAI uniquement)
    let aiResponse = null;
    try {
      // Utiliser le service IA unifié - OpenAI uniquement
      aiResponse = await AIService.generateResponse(
        prompt,
        req.user.id,
        [], // Pas d'historique de conversation
        {
          analysis,
          habits: userHabits
        }
      );
    } catch (aiError) {
      console.error('Error calling AI service:', aiError);
      // Pas de fallback - retourner une erreur claire
      return res.status(500).json({
        success: false,
        message: aiError.message || 'Erreur lors de la génération des insights IA. Vérifiez que le modèle ML local est correctement configuré.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        analysis,
        aiInsights: aiResponse,
        generatedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Error getting AI insights:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get habit recommendations
// @route   GET /api/analysis/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const analysis = await HabitAnalysisService.analyzeUserHabits(req.user.id);
    const userHabits = await Habit.find({ user: req.user.id });
    
    // Générer des recommandations d'habitudes basées sur les données
    const recommendations = generateHabitRecommendations(analysis, userHabits);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Generate weekly report
// @route   GET /api/analysis/weekly-report
// @access  Private
exports.getWeeklyReport = async (req, res) => {
  try {
    const analysis = await HabitAnalysisService.analyzeUserHabits(req.user.id);
    const userHabits = await Habit.find({ user: req.user.id });
    
    // Générer un rapport hebdomadaire détaillé
    const report = generateWeeklyReport(analysis, userHabits);
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error generating weekly report:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Fonction de fallback pour générer des insights sans IA
// NOTE: Cette fonction n'est plus utilisée - toutes les réponses passent par OpenAI
// Conservée uniquement pour référence historique
function generateFallbackInsights(analysis, userHabits) {
  let insights = `📊 **Analyse de vos habitudes**\n\n`;
  
  // Analyse du score
  if (analysis.score >= 80) {
    insights += `🎉 Excellent travail ! Votre score de ${analysis.score}/100 montre une excellente discipline.\n\n`;
  } else if (analysis.score >= 60) {
    insights += `👍 Bon travail ! Votre score de ${analysis.score}/100 est encourageant, continuez vos efforts.\n\n`;
  } else {
    insights += `💪 Votre score de ${analysis.score}/100 montre qu'il y a de la place pour l'amélioration. Ne vous découragez pas !\n\n`;
  }
  
  // Conseils spécifiques
  insights += `**Conseils personnalisés :**\n`;
  
  if (analysis.averageStreak < 5) {
    insights += `1. Concentrez-vous sur la constance : commencez par maintenir une habitude pendant 7 jours consécutifs.\n`;
  } else {
    insights += `1. Excellente constance ! Essayez d'ajouter une nouvelle habitude complémentaire.\n`;
  }
  
  if (analysis.completedToday < analysis.activeHabits) {
    insights += `2. Il vous reste ${analysis.activeHabits - analysis.completedToday} habitude(s) à compléter aujourd'hui.\n`;
  } else {
    insights += `2. Parfait ! Vous avez complété toutes vos habitudes aujourd'hui.\n`;
  }
  
  const categories = Object.keys(analysis.categoryDistribution);
  if (categories.length < 3) {
    insights += `3. Diversifiez vos habitudes en explorant de nouvelles catégories comme l'exercice, la nutrition ou le bien-être mental.\n\n`;
  } else {
    insights += `3. Excellente diversité dans vos habitudes ! Maintenez cet équilibre.\n\n`;
  }
  
  // Message de motivation
  insights += `**Message de motivation :**\n`;
  insights += `Chaque petit pas compte ! Vos efforts d'aujourd'hui construisent la personne que vous voulez devenir demain. Continuez à avancer, même si c'est lentement. 🌟`;
  
  return insights;
}

// Générer des recommandations d'habitudes
function generateHabitRecommendations(analysis, userHabits) {
  const recommendations = [];
  const existingCategories = Object.keys(analysis.categoryDistribution);
  
  // Recommandations basées sur les catégories manquantes
  const categoryRecommendations = {
    exercise: [
      { name: "Marcher 10 minutes", description: "Une promenade quotidienne pour commencer" },
      { name: "5 pompes", description: "Exercice simple pour renforcer le haut du corps" },
      { name: "Étirements matinaux", description: "5 minutes d'étirements au réveil" }
    ],
    nutrition: [
      { name: "Boire 8 verres d'eau", description: "Rester hydraté tout au long de la journée" },
      { name: "Manger 5 fruits/légumes", description: "Améliorer votre alimentation quotidienne" },
      { name: "Prendre un petit-déjeuner sain", description: "Commencer la journée avec de l'énergie" }
    ],
    sleep: [
      { name: "Se coucher avant 23h", description: "Améliorer la qualité de votre sommeil" },
      { name: "Pas d'écran 1h avant le coucher", description: "Préparer votre cerveau au repos" },
      { name: "Routine de relaxation", description: "5 minutes de méditation avant de dormir" }
    ],
    mood: [
      { name: "Gratitude quotidienne", description: "Noter 3 choses positives de votre journée" },
      { name: "Méditation 5 minutes", description: "Moment de calme et de centrage" },
      { name: "Appeler un proche", description: "Maintenir vos relations sociales" }
    ]
  };
  
  // Suggérer des habitudes pour les catégories manquantes
  ['exercise', 'nutrition', 'sleep', 'mood'].forEach(category => {
    if (!existingCategories.includes(category)) {
      const categoryHabits = categoryRecommendations[category];
      recommendations.push({
        category,
        title: `Habitudes ${category === 'exercise' ? 'Exercice' : category === 'nutrition' ? 'Nutrition' : category === 'sleep' ? 'Sommeil' : 'Bien-être'}`,
        habits: categoryHabits,
        priority: category === 'sleep' ? 'high' : 'medium'
      });
    }
  });
  
  return recommendations;
}

// Générer un rapport hebdomadaire
function generateWeeklyReport(analysis, userHabits) {
  const report = {
    period: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    summary: {
      totalHabits: analysis.totalHabits,
      averageScore: analysis.score,
      bestStreak: analysis.longestStreak,
      completionRate: analysis.activeHabits > 0 ? Math.round((analysis.completedToday / analysis.activeHabits) * 100) : 0
    },
    weeklyProgress: analysis.weeklyProgress,
    achievements: [],
    areasForImprovement: [],
    nextWeekGoals: []
  };
  
  // Identifier les réussites
  if (analysis.score >= 80) {
    report.achievements.push("Score excellent maintenu");
  }
  if (analysis.longestStreak >= 7) {
    report.achievements.push(`Série impressionnante de ${analysis.longestStreak} jours`);
  }
  
  // Identifier les domaines d'amélioration
  if (analysis.averageStreak < 5) {
    report.areasForImprovement.push("Améliorer la constance des habitudes");
  }
  if (Object.keys(analysis.categoryDistribution).length < 3) {
    report.areasForImprovement.push("Diversifier les types d'habitudes");
  }
  
  // Objectifs pour la semaine prochaine
  report.nextWeekGoals.push("Maintenir toutes les habitudes actuelles");
  if (analysis.totalHabits < 5) {
    report.nextWeekGoals.push("Ajouter une nouvelle habitude simple");
  }
  report.nextWeekGoals.push("Améliorer le score global de 10 points");
  
  return report;
}


