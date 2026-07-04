const { ForumCategory, ForumTopic, ForumReply, User } = require('../../models');

const forumController = {
  // --- Categories ---
  getCategories: async (req, res) => {
    try {
      // Auto-create default categories if empty
      const count = await ForumCategory.countDocuments();
      if (count === 0) {
        await ForumCategory.insertMany([
          { name: 'Announcements', description: 'Official announcements and updates.', icon: 'megaphone', order: 1 },
          { name: 'General Discussion', description: 'Chat about anything related to the platform.', icon: 'message-circle', order: 2 },
          { name: 'Help & Support', description: 'Ask questions and get help from the community.', icon: 'help-circle', order: 3 },
          { name: 'Showcase', description: 'Show off what you have built.', icon: 'star', order: 4 }
        ]);
      }
      const categories = await ForumCategory.find().sort({ order: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  getCategoryBySlug: async (req, res) => {
    try {
      const category = await ForumCategory.findOne({ slug: req.params.slug });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      
      const topics = await ForumTopic.find({ category: category._id })
        .populate('author', 'name avatar')
        .sort({ isPinned: -1, lastActivityAt: -1 })
        .limit(50);
        
      res.json({ category, topics });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category' });
    }
  },

  // --- Topics ---
  createTopic: async (req, res) => {
    try {
      const { title, content, categoryId } = req.body;
      const topic = new ForumTopic({
        title,
        content,
        category: categoryId,
        author: req.user.id
      });
      await topic.save();
      
      // Update topic count in category
      await ForumCategory.findByIdAndUpdate(categoryId, { $inc: { topicCount: 1 } });
      
      res.status(201).json(topic);
    } catch (error) {
      res.status(500).json({ message: 'Error creating topic', error: error.message });
    }
  },

  getTopicBySlug: async (req, res) => {
    try {
      const topic = await ForumTopic.findOne({ slug: req.params.slug })
        .populate('author', 'name avatar')
        .populate('category', 'name slug');
        
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      
      // Increment views
      topic.views += 1;
      await topic.save();

      const replies = await ForumReply.find({ topic: topic._id })
        .populate('author', 'name avatar')
        .sort({ createdAt: 1 });
        
      res.json({ topic, replies });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching topic' });
    }
  },

  // --- Replies ---
  createReply: async (req, res) => {
    try {
      const { content } = req.body;
      const topicId = req.params.id;
      
      const topic = await ForumTopic.findById(topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      if (topic.isLocked) return res.status(403).json({ message: 'Topic is locked' });

      const reply = new ForumReply({
        topic: topicId,
        author: req.user.id,
        content
      });
      await reply.save();
      await reply.populate('author', 'name avatar');
      
      topic.replyCount += 1;
      topic.lastActivityAt = new Date();
      await topic.save();
      
      res.status(201).json(reply);
    } catch (error) {
      res.status(500).json({ message: 'Error creating reply', error: error.message });
    }
  },
  
  toggleLikeReply: async (req, res) => {
    try {
      const reply = await ForumReply.findById(req.params.id);
      if (!reply) return res.status(404).json({ message: 'Reply not found' });
      
      const userId = req.user.id;
      const index = reply.likes.indexOf(userId);
      if (index === -1) {
        reply.likes.push(userId);
      } else {
        reply.likes.splice(index, 1);
      }
      await reply.save();
      res.json({ likes: reply.likes });
    } catch (error) {
      res.status(500).json({ message: 'Error liking reply' });
    }
  }
};

module.exports = forumController;
