const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const User = require('../models/User');
const UserBadge = require('../models/UserBadge');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/reversee')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing badges
      await Badge.deleteMany({});
      await UserBadge.deleteMany({});
      console.log('Cleared existing badges and user badges');
      
      // Create sample badges
      const badges = [
        {
          name: 'Premier Pas',
          description: 'Félicitations pour votre première habitude !',
          icon: 'trophy',
          category: 'achievement',
          criteria: {
            type: 'habit_count',
            value: 1
          },
          level: 1,
          color: 'blue',
          isActive: true
        },
        {
          name: 'Habitué',
          description: 'Vous avez ajouté 5 habitudes !',
          icon: 'star',
          category: 'milestone',
          criteria: {
            type: 'habit_count',
            value: 5
          },
          level: 2,
          color: 'green',
          isActive: true
        },
        {
          name: 'Maître des Habitudes',
          description: 'Impressionnant ! 10 habitudes enregistrées !',
          icon: 'sparkles',
          category: 'milestone',
          criteria: {
            type: 'habit_count',
            value: 10
          },
          level: 3,
          color: 'purple',
          isActive: true
        },
        {
          name: 'Constance',
          description: 'Une série de 7 jours consécutifs !',
          icon: 'fire',
          category: 'consistency',
          criteria: {
            type: 'streak',
            value: 7
          },
          level: 2,
          color: 'red',
          isActive: true
        },
        {
          name: 'Dormeur Expert',
          description: 'Spécialiste du sommeil avec 3 habitudes de sommeil !',
          icon: 'moon',
          category: 'special',
          criteria: {
            type: 'category_count',
            value: 3,
            category: 'sleep'
          },
          level: 2,
          color: 'indigo',
          isActive: true
        },
        {
          name: 'Athlète',
          description: 'Expert en exercice avec 3 habitudes d\'exercice !',
          icon: 'heart',
          category: 'special',
          criteria: {
            type: 'category_count',
            value: 3,
            category: 'exercise'
          },
          level: 2,
          color: 'pink',
          isActive: true
        },
        {
          name: 'Vétéran',
          description: 'Actif depuis 30 jours !',
          icon: 'academic',
          category: 'milestone',
          criteria: {
            type: 'days_active',
            value: 30
          },
          level: 3,
          color: 'yellow',
          isActive: true
        }
      ];
      
      // Insert badges
      const createdBadges = await Badge.insertMany(badges);
      console.log(`Created ${createdBadges.length} badges:`);
      createdBadges.forEach(badge => {
        console.log(`- ${badge.name}: ${badge.description}`);
      });
      
      console.log('\nBadges seeded successfully!');
      console.log('You can now test badge assignment from the admin panel.');
      
    } catch (error) {
      console.error('Error seeding badges:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
