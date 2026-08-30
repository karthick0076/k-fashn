const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/index');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple test to initialize DB tables automatically (optional, but good for local dev)
async function initializeDB() {
    try {
        const fs = require('fs');
        const setupSql = fs.readFileSync(path.join(__dirname, 'db', 'setup.sql')).toString();
        await db.query(setupSql);
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing DB:', error);
    }
}
initializeDB();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
