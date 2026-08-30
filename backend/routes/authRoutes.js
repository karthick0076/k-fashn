const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if(email === 'kfashn84@gmail.com' && password === 'kpkk7584') {
            return res.json({ success: true, role: 'admin', email });
        }
        
        // Check if user exists in DB, if not, create them (simulated signup as per spec)
        const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            if (user.password === password) {
                res.json({ success: true, role: 'user', email });
            } else {
                res.status(401).json({ success: false, message: 'Invalid password' });
            }
        } else {
            // Simulated signup
            await db.query('INSERT INTO Users (email, password, role) VALUES (?, ?, ?)', [email, password, 'user']);
            res.json({ success: true, role: 'user', email });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
