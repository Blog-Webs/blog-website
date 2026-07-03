const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');
const cache = require('../middleware/cacheMiddleware');

router.get('/', cache('search', 120), globalSearch);

module.exports = router;
