import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import axiosInstance from './axiosInstance';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [queueMessages, setQueueMessages] = useState([]);
  const [cacheTestResults, setCacheTestResults] = useState({
    firstFetchStatus: '',
    secondFetchStatus: '',
    overallMessage: ''
  });

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
  }, []);

  // Fetch products (with Redis caching in the backend)
  const fetchProducts = async () => {
    try {
      const backendUrl = `${process.env.REACT_APP_BACKEND_SERVICE}/api/products`;
      const response = await axios.get(backendUrl);
      setProducts(response.data.products);
      setLoading(false);
      return response.data.cacheStatus; // Return cacheStatus for testing
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Error fetching products: ${error.message}. Please try again later.`);
      setLoading(false);
      return null;
    }
  };

  const handleAddOrUpdateProduct = async () => {
    const backendUrl = selectedProductId 
      ? `${process.env.REACT_APP_BACKEND_SERVICE}/api/products/${selectedProductId}` 
      : `${process.env.REACT_APP_BACKEND_SERVICE}/api/products`;

    try {
      const response = selectedProductId
        ? await axiosInstance.put(backendUrl, {
            name: productName,
            price: parseFloat(productPrice),
          })
        : await axiosInstance.post(backendUrl, {
            name: productName,
            price: parseFloat(productPrice),
          });

      setResponseMessage(`Product ${selectedProductId ? 'updated' : 'added'}: ${response.data.name} - $${response.data.price}`);
      setProductName('');
      setProductPrice('');
      setSelectedProductId(null);

      await fetchProducts(); // Refresh the product list after adding/updating a product
    } catch (error) {
      console.error(`Error ${selectedProductId ? 'updating' : 'adding'} product:`, error);
      setResponseMessage(error.response ? error.response.data.message : 'Failed to perform operation');
    }
  };

  const handleDeleteProduct = async (id) => {
    const backendUrl = `${process.env.REACT_APP_BACKEND_SERVICE}/api/products/${id}`;

    try {
      await axiosInstance.delete(backendUrl);
      setResponseMessage('Product deleted successfully');

      await fetchProducts(); // Refresh the product list after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      setResponseMessage(error.response ? error.response.data.message : 'Failed to delete product');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    setProductName(product.name);
    setProductPrice(product.price);
  };

  // Fetch RabbitMQ messages
  const fetchQueueMessages = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_BACKEND_SERVICE}/api/queue/product_queue`);
      setQueueMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages from queue:', error);
      setQueueMessages([]);
    }
  };

  const clearQueueMessages = () => {
    setQueueMessages([]); // Clear the messages in the state
    setResponseMessage('Queue messages cleared');
  };

  const testRedisCache = async () => {
    try {
      // Clear Redis cache before starting the test
      setCacheTestResults({
        firstFetchStatus: '',
        secondFetchStatus: '',
        overallMessage: 'Clearing Redis cache...',
      });
  
      const backendUrl = `${process.env.REACT_APP_BACKEND_SERVICE}/api/cache/clear`;
      await axiosInstance.get(backendUrl); // Clear the cache before fetching products
  
      setCacheTestResults((prev) => ({
        ...prev,
        overallMessage: 'Redis cache cleared. Testing cache...',
      }));
  
      // First fetch to populate cache (should be a miss)
      setCacheTestResults((prev) => ({
        ...prev,
        firstFetchStatus: 'Fetching products from database (cache miss)...',
      }));
      const firstStatus = await fetchProducts();
  
      setCacheTestResults((prev) => ({
        ...prev,
        firstFetchStatus: `First Fetch: Cache ${firstStatus}`, // Expecting 'miss'
      }));
  
      // Wait a bit to simulate delay
      setTimeout(async () => {
        setCacheTestResults((prev) => ({
          ...prev,
          secondFetchStatus: 'Fetching products again (cache hit)...',
        }));
        const secondStatus = await fetchProducts();
  
        setCacheTestResults((prev) => ({
          ...prev,
          secondFetchStatus: `Second Fetch: Cache ${secondStatus}`, // Expecting 'hit'
          overallMessage: 'Cache test completed. Check the statuses above.',
        }));
      }, 2000);
    } catch (error) {
      console.error('Error testing Redis cache:', error);
      setCacheTestResults((prev) => ({
        ...prev,
        overallMessage: 'Error testing Redis cache',
      }));
    }
  };
  

  const clearRedisCache = async () => {
    try {
      const backendUrl = `${process.env.REACT_APP_BACKEND_SERVICE}/api/cache/clear`;
      await axiosInstance.get(backendUrl);
      setCacheTestResults(prev => ({ ...prev, overallMessage: 'Redis cache cleared successfully' }));
    } catch (error) {
      console.error('Error clearing Redis cache:', error);
      setCacheTestResults(prev => ({ ...prev, overallMessage: 'Failed to clear Redis cache' }));
    }
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (error) {
    return <div className="App">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product List</h1>
        <ul className="product-list">
          {products.length > 0 ? (
            products.map((product) => (
              <li key={product.id} className="product-item">
                <span className="product-name">{product.name} - ${product.price}</span>
                <div className="product-buttons">
                  <button className="edit-button" onClick={() => handleSelectProduct(product)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </div>
              </li>
            ))
          ) : (
            <li>No products available</li>
          )}
        </ul>
        <div className="product-form">
          <h2>{selectedProductId ? 'Update Product' : 'Add New Product'}</h2>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Product Price"
            value={productPrice}
            onChange={(e) => setProductPrice(parseFloat(e.target.value))}
            className="input-field"
          />
          <button className="submit-button" onClick={handleAddOrUpdateProduct}>
            {selectedProductId ? 'Update' : 'Add'} Product
          </button>
          <p>{responseMessage}</p>
        </div>
        <div className="queue-section">
          <h2>RabbitMQ - Queue Messages</h2>
          <button className="fetch-messages-button" onClick={fetchQueueMessages}>Fetch Queue Messages</button>
          <button className="clear-messages-button" onClick={clearQueueMessages}>Clear Messages</button>
          <ul className="queue-messages-list">
            {queueMessages.length > 0 ? (
              queueMessages.map((message, index) => (
                <li key={index} className="queue-message">{message}</li>
              ))
            ) : (
              <li>No messages in queue</li>
            )}
          </ul>
        </div>
        <div className="cache-section">
          <h2>Test Redis Cache</h2>
          <button className="cache-test-button" onClick={testRedisCache}>Test Cache</button>
          <button className="clear-cache-button" onClick={clearRedisCache}>Clear Cache</button>
          <div className="cache-test-results">
            <p>{cacheTestResults.firstFetchStatus}</p>
            <p>{cacheTestResults.secondFetchStatus}</p>
            <p>{cacheTestResults.overallMessage}</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;