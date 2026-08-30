const express = require('express');
const router = express.Router();
const db = require('../db');

// Place an order
router.post('/', async (req, res) => {
    const { items, total, userEmail } = req.body;
    const orderId = 'ORD' + Date.now();
    
    try {
        const { rows } = await db.query(
            'INSERT INTO Orders (orderId, userEmail, total) VALUES ($1, $2, $3) RETURNING id',
            [orderId, userEmail, total]
        );
        
        const orderDbId = rows[0].id;
        
        for (const item of items) {
            await db.query(
                'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderDbId, item.id, item.quantity, item.price]
            );
        }
        
        res.json({ success: true, orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all orders (for admin)
router.get('/', async (req, res) => {
    try {
        const { rows: orders } = await db.query('SELECT * FROM Orders ORDER BY created_at DESC');
        
        // Fetch items for each order
        for(let i=0; i<orders.length; i++) {
            const { rows: items } = await db.query(`
                SELECT oi.*, p.name, p.imageUrl 
                FROM OrderItems oi 
                JOIN Products p ON oi.product_id = p.id 
                WHERE oi.order_id = $1
            `, [orders[i].id]);
            orders[i].items = items;
        }
        
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
