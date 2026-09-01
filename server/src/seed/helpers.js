const slugify = require('slugify');

const mkSlug = (str) => slugify(str, { lower: true, strict: true });

const extractHeadings = (content) => {
  if (!content) return [];
  const headings = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim().replace(/[*_~`]/g, '');
      const id = slugify(title, { lower: true, strict: true });
      headings.push({ id, text: title, title, level });
    }
  }
  return headings;
};

module.exports = { mkSlug, extractHeadings };
