const { ForumCategory, ForumTopic, ForumReply, User } = require('../../models');

const forumController = {
  // --- Categories ---
  getCategories: async (req, res) => {
    try {
      let categories = await ForumCategory.find();
      const defaults = [
        { name: 'Announcements', slug: 'announcements', description: 'Official announcements and updates.', icon: 'megaphone', order: 1 },
        { name: 'General Discussion', slug: 'general-discussion', description: 'Chat about anything related to the platform.', icon: 'message-circle', order: 2 },
        { name: 'Help & Support', slug: 'help-support', description: 'Ask questions and get help from the community.', icon: 'help-circle', order: 3 },
        { name: 'Showcase', slug: 'showcase', description: 'Show off what you have built.', icon: 'star', order: 4 }
      ];

      for (const d of defaults) {
        let existing = null;
        if (d.slug === 'announcements') {
          existing = categories.find(c => c.slug === 'announcements');
        } else if (d.slug === 'general-discussion') {
          existing = categories.find(c => c.slug === 'general-discussion' || c.slug === 'general');
        } else if (d.slug === 'help-support') {
          existing = categories.find(c => c.slug === 'help-support' || c.slug === 'q-a');
        } else if (d.slug === 'showcase') {
          existing = categories.find(c => c.slug === 'showcase' || c.slug === 'show-tell');
        }

        if (existing) {
          existing.name = d.name;
          existing.slug = d.slug;
          existing.description = d.description;
          existing.icon = d.icon;
          existing.order = d.order;
          await existing.save();
        } else {
          const newCat = new ForumCategory(d);
          await newCat.save();
        }
      }

      categories = await ForumCategory.find().sort({ order: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error: error.message });
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

      const topicsWithReplies = await Promise.all(topics.map(async (topic) => {
        const latestReply = await ForumReply.findOne({ topic: topic._id })
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .select('content author createdAt');
        const topicObj = topic.toObject();
        topicObj.latestReply = latestReply;
        return topicObj;
      }));
        
      res.json({ category, topics: topicsWithReplies });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category' });
    }
  },

  // --- Topics ---
  getRecentTopics: async (req, res) => {
    try {
      const topics = await ForumTopic.find()
        .populate('author', 'name avatar')
        .populate('category', 'name slug')
        .sort({ lastActivityAt: -1 })
        .limit(10);

      const topicsWithReplies = await Promise.all(topics.map(async (topic) => {
        const latestReply = await ForumReply.findOne({ topic: topic._id })
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .select('content author createdAt');
        const topicObj = topic.toObject();
        topicObj.latestReply = latestReply;
        return topicObj;
      }));

      res.json(topicsWithReplies);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching recent topics' });
    }
  },

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
      
      const eventBus = require('../../events/EventBus');
      eventBus.emit('ActionOccurred', {
        type: 'COMMENT_ADDED',
        message: `${req.user.name} replied to the forum topic: ${topic.title}`,
        metadata: { userId: req.user.id, topicId: topic._id, topicSlug: topic.slug, replyId: reply._id }
      });
      
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
        
        const eventBus = require('../../events/EventBus');
        eventBus.emit('ActionOccurred', {
          type: 'REPLY_LIKED',
          message: `${req.user.name} liked a reply in a forum topic.`,
          metadata: { userId: req.user.id, replyId: reply._id, topicId: reply.topic }
        });
      } else {
        reply.likes.splice(index, 1);
      }
      await reply.save();
      res.json({ likes: reply.likes });
    } catch (error) {
      res.status(500).json({ message: 'Error liking reply' });
    }
  },

  toggleLikeTopic: async (req, res) => {
    try {
      const topic = await ForumTopic.findById(req.params.id);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      
      const userId = req.user.id;
      const index = topic.likes.indexOf(userId);
      if (index === -1) {
        topic.likes.push(userId);
        
        const eventBus = require('../../events/EventBus');
        eventBus.emit('ActionOccurred', {
          type: 'TOPIC_LIKED',
          message: `${req.user.name} liked the forum topic: ${topic.title}`,
          metadata: { userId: req.user.id, topicId: topic._id, topicSlug: topic.slug }
        });
      } else {
        topic.likes.splice(index, 1);
      }
      await topic.save();
      res.json({ likes: topic.likes });
    } catch (error) {
      res.status(500).json({ message: 'Error liking topic' });
    }
  },

  searchTopics: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);
      
      const regex = new RegExp(q, 'i');
      const topics = await ForumTopic.find({
        $or: [{ title: regex }, { content: regex }]
      })
      .populate('author', 'name avatar')
      .populate('category', 'name slug')
      .sort({ lastActivityAt: -1 })
      .limit(20);

      const topicsWithReplies = await Promise.all(topics.map(async (topic) => {
        const latestReply = await ForumReply.findOne({ topic: topic._id })
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .select('content author createdAt');
        const topicObj = topic.toObject();
        topicObj.latestReply = latestReply;
        return topicObj;
      }));
      
      res.json(topicsWithReplies);
    } catch (error) {
      res.status(500).json({ message: 'Error searching topics' });
    }
  },

  deleteReply: async (req, res) => {
    try {
      const reply = await ForumReply.findById(req.params.id);
      if (!reply) return res.status(404).json({ message: 'Reply not found' });

      // Check auth: Must be admin or the author
      if (req.user.role !== 'admin' && req.user.id !== reply.author.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this reply' });
      }

      await ForumReply.findByIdAndDelete(req.params.id);
      
      // Update topic reply count
      const topic = await ForumTopic.findById(reply.topic);
      if (topic) {
        topic.replyCount = Math.max(0, topic.replyCount - 1);
        await topic.save();
      }

      res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting reply', error: error.message });
    }
  },

  getForumStats: async (req, res) => {
    try {
      const activeDiscussions = await ForumTopic.find()
        .sort({ replyCount: -1, lastActivityAt: -1 })
        .limit(3)
        .select('title slug replyCount');

      const topContributorsData = await ForumReply.aggregate([
        { $group: { _id: '$author', commentCount: { $sum: 1 } } },
        { $sort: { commentCount: -1 } },
        { $limit: 3 }
      ]);

      const populatedContributors = await Promise.all(
        topContributorsData.map(async (item) => {
          const user = await User.findById(item._id).select('name avatar');
          return {
            _id: item._id,
            name: user ? user.name : 'Unknown',
            avatar: user ? user.avatar : '',
            commentCount: item.commentCount,
            karma: item.commentCount * 100
          };
        })
      );

      const activeUsersCount = await User.countDocuments();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const threadsTodayCount = await ForumTopic.countDocuments({ createdAt: { $gte: oneDayAgo } });

      res.json({
        activeDiscussions,
        topContributors: populatedContributors,
        activeUsersCount,
        threadsTodayCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching forum stats', error: error.message });
    }
  }
};

module.exports = forumController;
