const BaseEntity = require('../../../../shared/domain/BaseEntity');

class BlogEntity extends BaseEntity {
  constructor({ id, title, subtitle, slug, coverImage, content, contentBlocks, headings, excerpt, tags, category, series, seriesOrder, author, status, publishedAt, readTimeMinutes, views, likes, createdAt, updatedAt }) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.subtitle = subtitle || '';
    this.slug = slug;
    this.coverImage = coverImage || '';
    this.content = content;
    this.contentBlocks = contentBlocks;
    this.headings = headings || [];
    this.excerpt = excerpt || '';
    this.tags = tags || [];
    this.category = category || 'General';
    this.series = series || null;
    this.seriesOrder = seriesOrder || 0;
    this.author = author;
    this.status = status || 'draft';
    this.publishedAt = publishedAt;
    this.readTimeMinutes = readTimeMinutes || 5;
    this.views = views || 0;
    this.likes = likes || [];
  }

  isPublished() {
    return this.status === 'published';
  }
}

module.exports = BlogEntity;
