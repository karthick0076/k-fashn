import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="navbar">
            <Link to={user?.role === 'admin' ? '/admin' : '/home'} className="navbar-brand">K-Fashn</Link>
            <div className="navbar-links">
                {user?.role === 'user' && (
                    <>
                        <Link to="/home" className="nav-link">Shop</Link>
                        <Link to="/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShoppingBag size={20} />
                            <span>Cart ({totalItems})</span>
                        </Link>
                    </>
                )}
                {user?.role === 'admin' && (
                    <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.8rem' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
