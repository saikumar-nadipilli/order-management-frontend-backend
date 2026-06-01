import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import Alert from '../components/Alert';
import { useApi } from '../hooks/useApi';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

function validateProduct(form, isEdit) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!isEdit && !form.sku.trim()) errors.sku = 'SKU is required';
  if (form.sku.trim() && form.sku.length > 100) errors.sku = 'SKU too long';
  const price = parseFloat(form.price);
  if (!form.price || isNaN(price) || price <= 0) errors.price = 'Price must be greater than 0';
  const qty = parseInt(form.quantity_in_stock, 10);
  if (form.quantity_in_stock === '' || isNaN(qty) || qty < 0)
    errors.quantity_in_stock = 'Quantity must be 0 or more';
  return errors;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const { loading, error, success, run, clearMessages } = useApi();

  const load = useCallback(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    clearMessages();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setFieldErrors({});
    clearMessages();
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateProduct(form, !!editing);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    await run(async () => {
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalOpen(false);
      load();
    }, editing ? 'Product updated successfully' : 'Product created successfully');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await run(async () => {
      await api.deleteProduct(id);
      load();
    }, 'Product deleted');
  };

  return (
    <>
      <div className="page-header">
        <h1>Products</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Product
        </button>
      </div>

      <Alert message={error} onClose={clearMessages} />
      <Alert type="success" message={success} onClose={clearMessages} />

      <div className="card table-wrap">
        {products.length === 0 ? (
          <p className="empty">No products yet. Add your first product.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span
                      className={
                        p.quantity_in_stock <= 10 ? 'badge badge-warning' : 'badge badge-ok'
                      }
                    >
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {fieldErrors.name && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors.name}</small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU / Code</label>
                <input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  disabled={!!editing}
                />
                {fieldErrors.sku && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors.sku}</small>
                )}
              </div>
              <div className="form-row cols-2">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                  {fieldErrors.price && (
                    <small style={{ color: 'var(--danger)' }}>{fieldErrors.price}</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="qty">Quantity in Stock</label>
                  <input
                    id="qty"
                    type="number"
                    min="0"
                    value={form.quantity_in_stock}
                    onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                  />
                  {fieldErrors.quantity_in_stock && (
                    <small style={{ color: 'var(--danger)' }}>{fieldErrors.quantity_in_stock}</small>
                  )}
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
