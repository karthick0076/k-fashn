import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) return <Navigate to="/" />;
    if (roleRequired && user.role !== roleRequired) return <Navigate to="/home" />;
    
    return children;
};

const AppRoutes = () => {
    const { user } = useContext(AuthContext);

    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {user && <Navbar />}
                <div style={{ flex: '1' }}>
                    <Routes>
                        <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/home" />) : <Login />} />
                        
                        {/* User Routes */}
                        <Route path="/home" element={<ProtectedRoute roleRequired="user"><Home /></ProtectedRoute>} />
                        <Route path="/product/:id" element={<ProtectedRoute roleRequired="user"><ProductDetail /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute roleRequired="user"><Cart /></ProtectedRoute>} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
                    </Routes>
                </div>
                <footer style={{ background: '#f8ecec', padding: '2rem', textAlign: 'center', borderTop: '1px solid #eee' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>K-Fashn</h3>
                    <p style={{ marginBottom: '0.5rem', color: '#555' }}>
                        Follow us on Instagram: <strong>@k__fashn</strong>
                    </p>
                    <p style={{ color: '#555' }}>
                        WhatsApp for queries: <strong>8072729355</strong>
                    </p>
                </footer>
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
