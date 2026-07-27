import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "./AdminProducts.css";
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from "react-icons/fa";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Pagination details
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [specifications, setSpecifications] = useState("");
  
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch Categories for dropdown selector
  useEffect(() => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  // Fetch Products
  const loadProducts = useCallback(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/products?page=${currentPage}&size=6&sortBy=id&direction=desc`)
      .then(res => {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      })
      .catch(err => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, [currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setCategoryId("");
    setBrand("");
    setStock("");
    setDiscountPercentage("0");
    setSpecifications("");
    setEditId(null);
  };

  const addOrUpdateProduct = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      categoryId: parseInt(categoryId),
      brand,
      stock: parseInt(stock),
      discountPercentage: parseFloat(discountPercentage),
      specifications
    };

    try {
      if (editId) {
        await axios.put(
          `http://localhost:8080/api/products/${editId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/products",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed ❌");
    }
  };

  const editProduct = (p) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setImageUrl(p.imageUrl);
    setCategoryId(p.categoryId || "");
    setBrand(p.brand || "");
    setStock(p.stock || "");
    setDiscountPercentage(p.discountPercentage || "0");
    setSpecifications(p.specifications || "");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="admin-wrapper animate-fade">
      <AdminNavbar />

      <div className="admin-products-container">
        <h2>Manage Products</h2>
        <p className="admin-subtitle">Create, read, update and delete products catalog listings</p>

        <div className="products-crud-layout">
          {/* Create / Edit Form Card */}
          <form onSubmit={addOrUpdateProduct} className="admin-product-form">
            <h3>{editId ? `Edit Product #${editId}` : "Add New Product"}</h3>

            <div className="input-group">
              <label>Product Name</label>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Wireless Headphones"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea 
                className="input-premium"
                rows="3"
                placeholder="High fidelity sound isolation over-ear headphones..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required
              />
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  className="input-premium"
                  placeholder="2999"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Discount (%)</label>
                <input 
                  type="number" 
                  className="input-premium"
                  placeholder="10"
                  value={discountPercentage} 
                  onChange={e => setDiscountPercentage(e.target.value)} 
                />
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Category</label>
                <select 
                  className="input-premium"
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Brand</label>
                <input 
                  type="text" 
                  className="input-premium"
                  placeholder="Sony"
                  value={brand} 
                  onChange={e => setBrand(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Stock Qty</label>
                <input 
                  type="number" 
                  className="input-premium"
                  placeholder="50"
                  value={stock} 
                  onChange={e => setStock(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  className="input-premium"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Technical Specifications (JSON format)</label>
              <textarea 
                className="input-premium"
                rows="3"
                placeholder='{"Driver Size": "40mm", "Battery": "30 hrs"}'
                value={specifications} 
                onChange={e => setSpecifications(e.target.value)} 
              />
            </div>

            <div className="form-action-row">
              <button type="submit" className="btn-premium">
                {editId ? <><FaSave /> Update</> : <><FaPlus /> Create</>}
              </button>
              {editId && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>

          {/* Listings List Table */}
          <div className="products-list-panel">
            <h3>Catalog Inventory</h3>

            {loading ? (
              <div className="spinner-center"><div className="spinner"></div></div>
            ) : products.length > 0 ? (
              <div className="products-table-container">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Info</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th className="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.imageUrl} alt={p.name} className="admin-prod-thumb" />
                        </td>
                        <td>
                          <div className="prod-meta-cell">
                            <b>{p.name}</b>
                            <span>Category ID: {p.categoryId} | Brand: {p.brand}</span>
                          </div>
                        </td>
                        <td>₹{p.price}</td>
                        <td>
                          <span className={`stock-badge ${p.stock <= 5 ? "low" : "ok"}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="btn-edit-action" onClick={() => editProduct(p)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="btn-delete-action" onClick={() => deleteProduct(p.id)} title="Delete">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="admin-pagination">
                    <button 
                      onClick={() => setCurrentPage(currentPage - 1)} 
                      disabled={currentPage === 0}
                    >
                      Prev
                    </button>
                    <span>Page {currentPage + 1} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(currentPage + 1)} 
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p>No products found in database.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
