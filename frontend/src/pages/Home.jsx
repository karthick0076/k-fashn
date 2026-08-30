import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, getImageUrl } from '../utils/api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('All');
    const [featured, setFeatured] = useState([]);
    const categories = ['All', 'Saree', 'Clips', 'Accessories'];

    useEffect(() => {
        apiFetch('/api/products')
            .then(data => {
                setProducts(data);
                setFeatured(data.slice(0, 4));
            })
            .catch(err => console.error(err));
    }, []);

    const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

    return (
        <div>
            <div className="hero">
                <div>
                    <h1>Elegance in Every Thread</h1>
                    <p>Discover our exclusive collection of premium sarees and exquisite accessories.</p>
                    <button className="btn-primary" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>Shop Collection</button>
                </div>
            </div>

            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)}
                            className={filter === cat ? 'btn-primary' : 'btn-secondary'}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-img" />
                            <div className="product-info">
                                <h3 className="product-title">{product.name}</h3>
                                <p className="product-price">₹{product.price}</p>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>{product.category}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
