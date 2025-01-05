const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all items (public)
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new item (admin only)
router.post('/', authMiddleware, async (req, res) => {
    const { name, description, price } = req.body;

    try {
        const newItem = new Item({ name, description, price });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an item (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).send('Item not found');

        const { name, description, price } = req.body;
        item.name = name || item.name;
        item.description = description || item.description;
        item.price = price || item.price;

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an item (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).send('Item not found');

        await item.remove();
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
