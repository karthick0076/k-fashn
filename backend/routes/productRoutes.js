const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');

// Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const [result] = await db.query(
            'INSERT INTO Products (name, description, price, category, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, category, imageUrl]
        );
        
        res.json({ id: result.insertId, name, description, price, category, imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            await db.query(
                'UPDATE Products SET name = ?, description = ?, price = ?, category = ?, imageUrl = ? WHERE id = ?',
                [name, description, price, category, imageUrl, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE Products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
                [name, description, price, category, req.params.id]
            );
        }
        
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
