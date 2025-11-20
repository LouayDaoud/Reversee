const Habit = require('../models/Habit');
const User = require('../models/User');

class HabitAnalysisService {
  
  // Analyser les habitudes d'un utilisateur
  static async analyzeUserHabits(userId) {
    try {
      const habits = await Habit.find({ user: userId }).sort({ createdAt: -1 });
      const user = await User.findById(userId);
      
      if (!habits.length) {
        return {
          summary: "Aucune habitude trouvée. Commencez par ajouter quelques habitudes pour obtenir des analyses.",
          insights: [],
          recommendations: [],
          score: 0
        };
      }

      const analysis = {
        totalHabits: habits.length,
        activeHabits: habits.filter(h => h.isActive).length,
        completedToday: habits.filter(h => this.isCompletedToday(h)).length,
        averageStreak: this.calculateAverageStreak(habits),
        longestStreak: this.getLongestStreak(habits),
        categoryDistribution: this.getCategoryDistribution(habits),
        weeklyProgress: this.getWeeklyProgress(habits),
        insights: this.generateInsights(habits),
        recommendations: this.generateRecommendations(habits),
        score: this.calculateOverallScore(habits)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing user habits:', error);
      throw error;
    }
  }

  // Vérifier si une habitude a été complétée aujourd'hui
  static isCompletedToday(habit) {
    const today = new Date().toDateString();
    return habit.completedDates && habit.completedDates.some(date => 
      new Date(date).toDateString() === today
    );
  }

  // Calculer la moyenne des séries
  static calculateAverageStreak(habits) {
    if (!habits.length) return 0;
    const totalStreak = habits.reduce((sum, habit) => sum + (habit.streak || 0), 0);
    return Math.round(totalStreak / habits.length);
  }

  // Obtenir la plus longue série
  static getLongestStreak(habits) {
    return habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
  }

  // Distribution par catégorie
  static getCategoryDistribution(habits) {
    const distribution = {};
    habits.forEach(habit => {
      distribution[habit.category] = (distribution[habit.category] || 0) + 1;
    });
    return distribution;
  }

  // Progrès hebdomadaire
  static getWeeklyProgress(habits) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return habits.map(habit => {
      const recentCompletions = habit.completedDates ? 
        habit.completedDates.filter(date => new Date(date) >= oneWeekAgo).length : 0;
      
      return {
        habitName: habit.name,
        completions: recentCompletions,
        percentage: Math.round((recentCompletions / 7) * 100)
      };
    });
  }

  // Générer des insights automatiques
  static generateInsights(habits) {
    const insights = [];
    
    // Insight sur la constance
    const averageStreak = this.calculateAverageStreak(habits);
    if (averageStreak > 7) {
      insights.push({
        type: 'success',
        title: 'Excellente constance !',
        message: `Votre série moyenne de ${averageStreak} jours montre une excellente discipline.`
      });
    } else if (averageStreak < 3) {
      insights.push({
        type: 'warning',
        title: 'Travaillez votre constance',
        message: `Votre série moyenne de ${averageStreak} jours peut être améliorée. Essayez de vous concentrer sur une habitude à la fois.`
      });
    }

    // Insight sur les catégories
    const categoryDist = this.getCategoryDistribution(habits);
    const categories = Object.keys(categoryDist);
    if (categories.length === 1) {
      insights.push({
        type: 'info',
        title: 'Diversifiez vos habitudes',
        message: `Toutes vos habitudes sont dans la catégorie "${categories[0]}". Considérez ajouter des habitudes dans d'autres domaines.`
      });
    }

    // Insight sur l'activité récente
    const completedToday = habits.filter(h => this.isCompletedToday(h)).length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const completionRate = activeHabits > 0 ? (completedToday / activeHabits) * 100 : 0;
    
    if (completionRate === 100) {
      insights.push({
        type: 'success',
        title: 'Journée parfaite !',
        message: 'Vous avez complété toutes vos habitudes aujourd\'hui. Continuez comme ça !'
      });
    } else if (completionRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Rattrapez-vous !',
        message: `Vous n'avez complété que ${Math.round(completionRate)}% de vos habitudes aujourd'hui. Il est encore temps !`
      });
    }

    return insights;
  }

  // Générer des recommandations
  static generateRecommendations(habits) {
    const recommendations = [];
    
    // Recommandation basée sur le nombre d'habitudes
    if (habits.length < 3) {
      recommendations.push({
        type: 'add_habit',
        title: 'Ajoutez plus d\'habitudes',
        message: 'Vous avez peu d\'habitudes. Considérez ajouter 2-3 habitudes simples pour commencer.',
        action: 'add_habit'
      });
    } else if (habits.length > 10) {
      recommendations.push({
        type: 'simplify',
        title: 'Simplifiez vos habitudes',
        message: 'Vous avez beaucoup d\'habitudes. Concentrez-vous sur les plus importantes.',
        action: 'review_habits'
      });
    }

    // Recommandation basée sur les catégories manquantes
    const categoryDist = this.getCategoryDistribution(habits);
    const missingCategories = ['exercise', 'nutrition', 'sleep', 'mood'].filter(
      cat => !categoryDist[cat]
    );
    
    if (missingCategories.length > 0) {
      recommendations.push({
        type: 'category',
        title: 'Explorez de nouvelles catégories',
        message: `Considérez ajouter des habitudes dans : ${missingCategories.join(', ')}`,
        action: 'explore_categories'
      });
    }

    // Recommandation basée sur les séries faibles
    const weakHabits = habits.filter(h => (h.streak || 0) < 3);
    if (weakHabits.length > 0) {
      recommendations.push({
        type: 'improve',
        title: 'Renforcez vos habitudes faibles',
        message: `${weakHabits.length} habitude(s) ont des séries courtes. Concentrez-vous sur celles-ci.`,
        action: 'focus_weak_habits'
      });
    }

    return recommendations;
  }

  // Calculer un score global
  static calculateOverallScore(habits) {
    if (!habits.length) return 0;
    
    const activeHabits = habits.filter(h => h.isActive);
    const completedToday = habits.filter(h => this.isCompletedToday(h)).length;
    const averageStreak = this.calculateAverageStreak(habits);
    
    // Score basé sur plusieurs facteurs
    let score = 0;
    
    // Facteur de complétion du jour (40% du score)
    if (activeHabits.length > 0) {
      score += (completedToday / activeHabits.length) * 40;
    }
    
    // Facteur de constance (40% du score)
    score += Math.min(averageStreak * 4, 40);
    
    // Facteur de diversité (20% du score)
    const categories = Object.keys(this.getCategoryDistribution(habits));
    score += Math.min(categories.length * 5, 20);
    
    return Math.round(score);
  }

  // Générer un prompt pour l'IA basé sur les données
  static generateAIPrompt(analysis, userHabits) {
    const habitsList = userHabits.map(h => `${h.name} (${h.category}, série: ${h.streak || 0})`).join(', ');
    
    return `
Analysez les habitudes suivantes d'un utilisateur et fournissez des conseils personnalisés :

Habitudes: ${habitsList}

Statistiques:
- Total d'habitudes: ${analysis.totalHabits}
- Habitudes actives: ${analysis.activeHabits}
- Complétées aujourd'hui: ${analysis.completedToday}
- Série moyenne: ${analysis.averageStreak} jours
- Plus longue série: ${analysis.longestStreak} jours
- Score global: ${analysis.score}/100

Fournissez:
1. Une analyse personnalisée de leurs habitudes
2. 3 conseils spécifiques pour améliorer
3. Une habitude recommandée à ajouter
4. Un message de motivation

Répondez en français et soyez encourageant mais constructif.
    `;
  }
}

module.exports = HabitAnalysisService;
