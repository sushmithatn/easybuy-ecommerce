import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "./AdminCategories.css";
import { FaTrash, FaPlus, FaTag } from "react-icons/fa";
import { API_URL } from "../../config";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const loadCategories = () => {
    setLoading(true);
   axios.get(`${API_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

const handleAddCategory = async (e) => {
  e.preventDefault();

  if (!newCategoryName.trim()) return;

  try {
    await axios.post(
      `${API_URL}/api/categories`,
      { 
        name: newCategoryName.trim() 
      },
      {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      }
    );

    setNewCategoryName("");
    loadCategories();

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to add category");
  }
};

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
    await axios.delete(`${API_URL}/api/categories/${id}`, {
  headers: { 
    Authorization: `Bearer ${token}` 
  }
});
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category. Verify if products are linked to it.");
    }
  };

  return (
    <div className="admin-wrapper animate-fade">
      <AdminNavbar />

      <div className="admin-categories-container">
        <h2>Manage Categories</h2>
        <p className="admin-subtitle">Add or remove product catalog divisions</p>

        <div className="categories-layout">
          {/* Create Form */}
          <form onSubmit={handleAddCategory} className="admin-category-form">
            <h3>Add New Category</h3>
            <div className="input-group">
              <label>Category Name</label>
              <div className="input-box-premium">
                <FaTag className="tag-icon" />
                <input 
                  type="text" 
                  placeholder="e.g. Home Decor" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn-premium add-category-btn">
              <FaPlus /> Create Category
            </button>
          </form>

          {/* List Table */}
          <div className="categories-list-panel">
            <h3>Existing Categories</h3>
            {loading ? (
              <div className="spinner-center"><div className="spinner"></div></div>
            ) : categories.length > 0 ? (
              <div className="categories-table-wrapper">
                <table className="admin-categories-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category Name</th>
                      <th className="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td className="cat-name-cell"><b>{cat.name}</b></td>
                        <td className="actions-cell">
                          <button 
                            className="btn-delete-cat" 
                            onClick={() => handleDeleteCategory(cat.id)}
                            title="Delete Category"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No categories found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
