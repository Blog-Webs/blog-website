const slugify = require('slugify');

const mkSlug = (str) => slugify(str, { lower: true, strict: true });

module.exports = { mkSlug };
