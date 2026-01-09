const HabitDNA = require('../models/HabitDNA');
const Habit = require('../models/Habit');
const User = require('../models/User');

/**
 * Service pour générer et gérer les Habit DNA
 */
class HabitDNAService {
  /**
   * Génère un code ADN unique basé sur les patterns d'habitudes
   */
  static generateDNASequence(habits, userStats) {
    // Si pas d'habitudes, retourner des valeurs par défaut
    if (!habits || habits.length === 0) {
      const defaultPatterns = {
        consistency: 0,
        diversity: 0,
        intensity: 0,
        balance: 0,
        growth: 0
      };
      return {
        dnaSequence: this.createSequence(defaultPatterns),
        components: defaultPatterns,
        colors: {
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#D1D5DB'
        },
        visualPattern: this.generateVisualPattern(defaultPatterns)
      };
    }

    // Analyser les patterns d'habitudes
    const patterns = this.analyzeHabitPatterns(habits, userStats);
    
    // Générer la séquence ADN
    const sequence = this.createSequence(patterns);
    
    return {
      dnaSequence: sequence,
      components: patterns,
      colors: this.generateColors(patterns),
      visualPattern: this.generateVisualPattern(patterns)
    };
  }

  /**
   * Analyse les patterns d'habitudes pour extraire les composants
   */
  static analyzeHabitPatterns(habits, stats) {
    if (!habits || habits.length === 0) {
      return {
        consistency: 0,
        diversity: 0,
        intensity: 0,
        balance: 0,
        growth: 0
      };
    }

    const totalHabits = habits.length;
    const categories = {};
    const dates = [];
    const values = [];

    habits.forEach(habit => {
      if (!habit) return;
      
      // Compter les catégories
      if (habit.category) {
        categories[habit.category] = (categories[habit.category] || 0) + 1;
      }
      
      // Collecter les dates
      if (habit.date) {
        try {
          dates.push(new Date(habit.date));
        } catch (e) {
          console.warn('Invalid date:', habit.date);
        }
      }
      
      // Collecter les valeurs
      if (habit.value != null && !isNaN(habit.value)) {
        values.push(Number(habit.value));
      }
    });

    // Calculer la consistance (régularité)
    const consistency = this.calculateConsistency(dates);
    
    // Calculer la diversité (nombre de catégories différentes)
    const diversity = this.calculateDiversity(categories, totalHabits);
    
    // Calculer l'intensité (valeurs moyennes)
    const intensity = this.calculateIntensity(values);
    
    // Calculer l'équilibre (répartition entre catégories)
    const balance = this.calculateBalance(categories);
    
    // Calculer la croissance (tendance au fil du temps)
    const growth = this.calculateGrowth(habits, stats);

    return {
      consistency: Math.round(consistency),
      diversity: Math.round(diversity),
      intensity: Math.round(intensity),
      balance: Math.round(balance),
      growth: Math.round(growth)
    };
  }

  /**
   * Calcule la consistance (0-100)
   */
  static calculateConsistency(dates) {
    if (!dates || dates.length < 2) return 0;
    
    dates.sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      const diff = dates[i] - dates[i - 1];
      intervals.push(diff);
    }
    
    if (intervals.length === 0) return 50;
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Plus la variance est faible, plus la consistance est élevée
    const consistency = Math.max(0, Math.min(100, 100 - (variance / (avgInterval * avgInterval)) * 100));
    
    return consistency;
  }

  /**
   * Calcule la diversité (0-100)
   */
  static calculateDiversity(categories, totalHabits) {
    if (!categories || !totalHabits || totalHabits === 0) return 0;
    
    const numCategories = Object.keys(categories).length;
    const maxCategories = 7; // Nombre de catégories possibles
    
    return (numCategories / maxCategories) * 100;
  }

  /**
   * Calcule l'intensité (0-100)
   */
  static calculateIntensity(values) {
    if (!values || values.length === 0) return 0;
    
    const validValues = values.filter(v => v != null && !isNaN(v));
    if (validValues.length === 0) return 0;
    
    const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const max = Math.max(...validValues);
    
    if (max === 0) return 0;
    
    return (avg / max) * 100;
  }

  /**
   * Calcule l'équilibre (0-100)
   */
  static calculateBalance(categories) {
    if (!categories || Object.keys(categories).length === 0) return 0;
    const counts = Object.values(categories);
    if (counts.length === 0) return 0;
    
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => {
      return sum + Math.pow(count - avg, 2);
    }, 0) / counts.length;
    
    // Plus la variance est faible, plus l'équilibre est élevé
    return Math.max(0, Math.min(100, 100 - (variance / (avg * avg)) * 100));
  }

  /**
   * Calcule la croissance (0-100)
   */
  static calculateGrowth(habits, stats) {
    if (!habits || habits.length === 0) return 0;
    
    // Si pas de stats, calculer basé sur les habitudes récentes
    if (!stats || !stats.streaks || stats.streaks.length === 0) {
      // Comparer les habitudes récentes avec les anciennes
      const recentHabits = habits.slice(0, Math.min(10, habits.length));
      const olderHabits = habits.slice(10, Math.min(20, habits.length));
      
      if (olderHabits.length === 0) return 50; // Pas assez de données
      
      const recentAvg = recentHabits.reduce((sum, h) => sum + (h.value || 0), 0) / recentHabits.length;
      const olderAvg = olderHabits.reduce((sum, h) => sum + (h.value || 0), 0) / olderHabits.length;
      
      if (olderAvg === 0) return recentAvg > 0 ? 100 : 0;
      
      const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
      return Math.max(0, Math.min(100, 50 + growth));
    }
    
    // Analyser les streaks pour déterminer la croissance
    const activeStreaks = stats.streaks.filter(s => s.isActive).length;
    const totalStreaks = stats.streaks.length;
    
    if (totalStreaks === 0) return 50;
    
    return (activeStreaks / totalStreaks) * 100;
  }

  /**
   * Crée la séquence ADN à partir des patterns
   */
  static createSequence(patterns) {
    // Convertir chaque composant en caractère hexadécimal
    const chars = '0123456789ABCDEF';
    let sequence = '';
    
    Object.values(patterns).forEach(value => {
      const hex = Math.round(value / 100 * 15).toString(16).toUpperCase();
      sequence += hex;
    });
    
    // Ajouter un hash pour l'unicité
    const hash = this.simpleHash(JSON.stringify(patterns));
    sequence += hash.substring(0, 8);
    
    return sequence.toUpperCase();
  }

  /**
   * Hash simple pour l'unicité
   */
  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }

  /**
   * Génère les couleurs basées sur les composants
   */
  static generateColors(components) {
    // Convertir les composants en couleurs HSL
    const hue = (components.consistency + components.diversity) % 360;
    const saturation = Math.min(100, components.intensity);
    const lightness = 50 + (components.balance / 2);
    
    const primary = this.hslToHex(hue, saturation, lightness);
    const secondary = this.hslToHex((hue + 60) % 360, saturation, lightness + 10);
    const accent = this.hslToHex((hue + 120) % 360, Math.min(100, saturation + 20), lightness - 10);
    
    return {
      primary,
      secondary,
      accent
    };
  }

  /**
   * Convertit HSL en Hex
   */
  static hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /**
   * Génère le pattern visuel
   */
  static generateVisualPattern(components) {
    const pattern = [];
    const steps = 20;
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const componentIndex = Math.floor(progress * 5);
      const componentValues = Object.values(components);
      const value = componentValues[componentIndex % componentValues.length];
      
      const hue = (value * 3.6) % 360;
      const color = this.hslToHex(hue, 70, 50);
      
      pattern.push({
        color,
        position: i
      });
    }
    
    return pattern;
  }

  /**
   * Calcule la compatibilité entre deux ADN
   */
  static calculateCompatibility(dna1, dna2) {
    let score = 0;
    let factors = [];
    
    // Comparer chaque composant
    Object.keys(dna1.components).forEach(key => {
      const diff = Math.abs(dna1.components[key] - dna2.components[key]);
      const similarity = Math.max(0, 100 - diff);
      score += similarity;
      
      if (similarity > 70) {
        factors.push(`${key}_similar`);
      }
    });
    
    score = score / Object.keys(dna1.components).length;
    
    return {
      score: Math.round(score),
      factors
    };
  }

  /**
   * Génère ou met à jour le Habit DNA d'un utilisateur
   */
  static async generateOrUpdateHabitDNA(userId) {
    try {
      // Récupérer les habitudes de l'utilisateur
      const habits = await Habit.find({ user: userId })
        .sort({ date: -1 })
        .limit(1000); // Limiter pour les performances
      
      // Récupérer les stats (si disponibles)
      const user = await User.findById(userId);
      
      // Générer le DNA
      const dnaData = this.generateDNASequence(habits, {});
      
      // Chercher ou créer le DNA
      let habitDNA = await HabitDNA.findOne({ user: userId });
      
      if (habitDNA) {
        // Vérifier s'il y a eu une mutation majeure
        const hasMajorChange = this.detectMajorChange(habitDNA.components, dnaData.components);
        
        if (hasMajorChange) {
          habitDNA.mutations.push({
            type: 'major_change',
            description: 'Changement majeur détecté dans les patterns d\'habitudes',
            previousDNA: habitDNA.dnaSequence
          });
        }
        
        // Mettre à jour
        habitDNA.dnaSequence = dnaData.dnaSequence;
        habitDNA.components = dnaData.components;
        habitDNA.colors = dnaData.colors;
        habitDNA.visualPattern = dnaData.visualPattern;
        habitDNA.stats.totalHabits = habits.length;
        habitDNA.stats.lastUpdated = new Date();
      } else {
        // Créer nouveau
        habitDNA = new HabitDNA({
          user: userId,
          ...dnaData,
          stats: {
            totalHabits: habits.length,
            lastUpdated: new Date()
          }
        });
      }
      
      await habitDNA.save();
      return habitDNA;
    } catch (error) {
      console.error('Error generating Habit DNA:', error);
      throw error;
    }
  }

  /**
   * Détecte un changement majeur
   */
  static detectMajorChange(oldComponents, newComponents) {
    let totalChange = 0;
    
    Object.keys(oldComponents).forEach(key => {
      const change = Math.abs(oldComponents[key] - newComponents[key]);
      totalChange += change;
    });
    
    // Si le changement total dépasse 50 points, c'est une mutation majeure
    return totalChange > 50;
  }
}

module.exports = HabitDNAService;

