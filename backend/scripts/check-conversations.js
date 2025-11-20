const mongoose = require('mongoose');
const ChatConversation = require('../models/ChatConversation');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/reversee')
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Count conversations
      const count = await ChatConversation.countDocuments();
      console.log(`Total conversations in database: ${count}`);

      // Get all conversations
      const conversations = await ChatConversation.find();

      console.log('\nConversations:');
      conversations.forEach((conversation, index) => {
        console.log(`\n--- Conversation ${index + 1} ---`);
        console.log(`ID: ${conversation._id}`);
        console.log(`User ID: ${conversation.user}`);
        console.log(`Started: ${conversation.startedAt}`);
        console.log(`Last updated: ${conversation.lastUpdatedAt}`);
        console.log(`Trigger habit ID: ${conversation.triggerHabit || 'None'}`);
        console.log(`Messages: ${conversation.messages.length}`);

        // Print first and last message if they exist
        if (conversation.messages.length > 0) {
          console.log('\nFirst message:');
          console.log(`Sender: ${conversation.messages[0].sender}`);
          console.log(`Text: ${conversation.messages[0].text.substring(0, 100)}${conversation.messages[0].text.length > 100 ? '...' : ''}`);
          console.log(`Time: ${conversation.messages[0].timestamp}`);

          if (conversation.messages.length > 1) {
            const lastMsg = conversation.messages[conversation.messages.length - 1];
            console.log('\nLast message:');
            console.log(`Sender: ${lastMsg.sender}`);
            console.log(`Text: ${lastMsg.text.substring(0, 100)}${lastMsg.text.length > 100 ? '...' : ''}`);
            console.log(`Time: ${lastMsg.timestamp}`);
          }
        }
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
