export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://kfashn-backend.onrender.com';
};

export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${getBaseUrl()}${url}`;
};

export const apiFetch = async (endpoint, options = {}) => {
    const url = `${getBaseUrl()}${endpoint}`;
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // If body is FormData (like image upload), do not set Content-Type header so browser sets multipart boundary
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(url, finalOptions);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
};
