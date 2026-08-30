import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { apiFetch, getImageUrl } from '../utils/api';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: cart,
                    total: cartTotal,
                    userEmail: user.email
                })
            });
            if (data.success) {
                setOrderSuccess(data.orderId);
                clearCart();
            }
        } catch (error) {
            alert('Checkout failed');
        }
        setLoading(false);
    };

    if (orderSuccess) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <h1 style={{ color: 'green', marginBottom: '1rem' }}>Order Confirmed!</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Your Order ID is <strong>#{orderSuccess}</strong></p>
                <div style={{ background: '#f8ecec', padding: '1.5rem', borderRadius: '8px', display: 'inline-block', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>To complete payment for your order, please contact us:</p>
                    <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>WhatsApp: <a href="https://wa.me/918072729355" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>8072729355</a></p>
                    <p style={{ fontSize: '1.2rem', margin: '0' }}>Instagram: <a href="https://instagram.com/k__fashn" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>@k__fashn</a></p>
                </div>
                <br />
                <button className="btn-primary" onClick={() => navigate('/home')}>Continue Shopping</button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <h2>Your cart is empty</h2>
                <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/home')}>Go Shop</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 5%' }}>
            <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
                        <img src={getImageUrl(item.imageUrl)} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{item.price}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '5px 10px', background: '#eee' }}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '5px 10px', background: '#eee' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', background: 'transparent' }}><Trash2 /></button>
                    </div>
                ))}
            </div>
            
            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow)', textAlign: 'right' }}>
                <h2>Total: <span style={{ color: 'var(--primary-color)' }}>₹{cartTotal.toFixed(2)}</span></h2>
                <button className="btn-primary" style={{ marginTop: '1rem', padding: '15px 30px', fontSize: '1.1rem' }} onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Processing...' : 'Proceed to Buy'}
                </button>
            </div>
        </div>
    );
};

export default Cart;
