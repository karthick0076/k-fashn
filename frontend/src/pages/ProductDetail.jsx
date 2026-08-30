import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

import { apiFetch, getImageUrl } from '../utils/api';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all and filter to find product and similar products
        apiFetch('/api/products')
            .then(data => {
                setAllProducts(data);
                const found = data.find(p => p.id.toString() === id);
                setProduct(found);
                window.scrollTo(0, 0); // scroll to top when id changes
            });
    }, [id]);

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    if (!product) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading...</div>;

    const similarProducts = allProducts.filter(p => p.category === product.category && p.id.toString() !== id).slice(0, 4);

    return (
        <div className="container" style={{ padding: '4rem 5%', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
                <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <img 
                        src={getImageUrl(product.imageUrl)} 
                        alt={product.name} 
                        style={{ width: '100%', maxWidth: '400px', height: '500px', objectFit: 'contain', borderRadius: '8px', boxShadow: 'var(--shadow)', background: '#fff' }} 
                    />
                </div>
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <span style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: '700', letterSpacing: '1px' }}>{product.category}</span>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0' }}>{product.name}</h1>
                    <h2 style={{ fontSize: '2rem' }}>₹{product.price}</h2>
                    <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.8' }}>{product.description}</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => addToCart(product)}>Add to Cart</button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleBuyNow}>Buy Now</button>
                    </div>
                </div>
            </div>

            {similarProducts.length > 0 && (
                <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Similar Products</h2>
                    <div className="product-grid">
                        {similarProducts.map(p => (
                            <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                <img src={getImageUrl(p.imageUrl)} alt={p.name} className="product-img" style={{ height: '300px', objectFit: 'contain' }} />
                                <div className="product-info">
                                    <h3 className="product-title">{p.name}</h3>
                                    <p className="product-price">₹{p.price}</p>
                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>{p.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
