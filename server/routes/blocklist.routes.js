const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { addBlockItem, getBlocklist, deleteBlockItem } = require('../controllers/blocklist.controller');

const blocklistRouter = express.Router();

blocklistRouter.use(authMiddleware);
blocklistRouter.post('/', addBlockItem);           // Add a new item
blocklistRouter.get('/', getBlocklist);            // Get all items
blocklistRouter.delete('/:id', deleteBlockItem);   // Remove item

module.exports = { blocklistRouter };
