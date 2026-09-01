import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // Product form state
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Saree');
    const [image, setImage] = useState(null);

    const fetchProducts = () => {
        apiFetch('/api/products')
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    const fetchOrders = () => {
        apiFetch('/api/orders')
            .then(data => setOrders(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const handleEditClick = (p) => {
        setEditingId(p.id);
        setName(p.name);
        setDescription(p.description);
        setPrice(p.price);
        setCategory(p.category);
        setImage(null);
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Saree');
        setImage(null);
    };

    const handleAddOrEditProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        if (image) formData.append('image', image);

        try {
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            await apiFetch(url, {
                method: method,
                body: formData
            });
            alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
            handleCancelEdit();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product', error);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 5%' }}>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('products')}>Manage Products</button>
                <button className={activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('orders')}>View Orders</button>
            </div>

            {activeTab === 'products' && (
                <div>
                    <div className="auth-card" style={{ maxWidth: '600px', margin: '0 0 2rem 0', textAlign: 'left' }}>
                        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleAddOrEditProduct}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" required className="form-control" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea required className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input type="number" step="0.01" required className="form-control" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="Saree">Saree</option>
                                    <option value="Clips">Clips</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Product Image {editingId && '(Leave blank to keep current)'}</label>
                                <input type="file" className="form-control" onChange={e => setImage(e.target.files[0])} accept="image/*" />
                                {image && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Selected preview:</p>
                                        <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '0.5rem' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingId ? 'Update Product' : 'Upload Product'}</button>
                                {editingId && <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={handleCancelEdit}>Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <h2>Existing Products</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--card-bg)' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary-color)', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Image</th>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{p.id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {p.imageUrl && <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${import.meta.env.VITE_API_URL || 'https://kfashn-backend.onrender.com'}${p.imageUrl}`} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{p.name}</td>
                                    <td style={{ padding: '1rem' }}>₹{p.price}</td>
                                    <td style={{ padding: '1rem' }}>{p.category}</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button onClick={() => handleEditClick(p)} style={{ color: 'var(--primary-color)', background: 'transparent', fontWeight: 'bold' }}>Edit</button>
                                        <button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'red', background: 'transparent', fontWeight: 'bold' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h2>Recent Orders</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {orders.map(order => (
                            <div key={order.id} style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3>Order #{order.orderId}</h3>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Total: ₹{order.total}</span>
                                </div>
                                <p style={{ marginBottom: '1rem', color: '#666' }}>Customer: {order.userEmail} | Date: {new Date(order.createdAt).toLocaleString()}</p>
                                
                                <h4>Items:</h4>
                                <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                                    {order.items && order.items.map(item => (
                                        <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                                            {item.product.name} (ID: #{item.product.id}) - Qty: {item.quantity} x ₹{item.price}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        {orders.length === 0 && <p>No orders yet.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
