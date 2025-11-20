const mongoose = require('mongoose');
const ChatConversation = require('../models/ChatConversation');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/reversee')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find a user to associate with the conversation
      const user = await User.findOne();
      
      if (!user) {
        console.error('No users found in the database');
        return;
      }
      
      console.log('Found user:', user.email);
      
      // Create a test conversation
      const testConversation = new ChatConversation({
        user: user._id,
        messages: [
          {
            text: 'Bonjour, je suis un message de test',
            sender: 'ai',
            timestamp: new Date()
          }
        ],
        startedAt: new Date(),
        lastUpdatedAt: new Date()
      });
      
      console.log('Created test conversation object:', testConversation);
      
      // Save the conversation
      const savedConversation = await testConversation.save();
      console.log('Test conversation saved successfully:', savedConversation);
      
      // Verify that the conversation was saved
      const conversations = await ChatConversation.find().populate('user', 'email');
      console.log(`\nTotal conversations in database: ${conversations.length}`);
      
      conversations.forEach((conversation, index) => {
        console.log(`\n--- Conversation ${index + 1} ---`);
        console.log(`ID: ${conversation._id}`);
        console.log(`User: ${conversation.user ? conversation.user.email : 'Unknown'}`);
        console.log(`Messages: ${conversation.messages.length}`);
        console.log(`First message: ${conversation.messages[0].text}`);
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Close the connection
      mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
