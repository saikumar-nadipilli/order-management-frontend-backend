import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';
import { useApi } from '../hooks/useApi';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: '1' }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const { loading, error, success, run, clearMessages } = useApi();

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
    });
  }, []);

  const addLine = () => {
    setLines([...lines, { product_id: '', quantity: '1' }]);
  };

  const updateLine = (index, field, value) => {
    const next = [...lines];
    next[index] = { ...next[index], [field]: value };
    setLines(next);
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!customerId) errors.customer = 'Select a customer';
    const validLines = lines.filter((l) => l.product_id);
    if (validLines.length === 0) errors.items = 'Add at least one product';
    const ids = new Set();
    validLines.forEach((l, i) => {
      const qty = parseInt(l.quantity, 10);
      if (!l.product_id) return;
      if (ids.has(l.product_id)) errors[`line_${i}`] = 'Duplicate product';
      ids.add(l.product_id);
      if (!l.quantity || isNaN(qty) || qty < 1) errors[`qty_${i}`] = 'Quantity must be at least 1';
      const product = products.find((p) => p.id === parseInt(l.product_id, 10));
      if (product && qty > product.quantity_in_stock) {
        errors[`qty_${i}`] = `Only ${product.quantity_in_stock} in stock`;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await run(async () => {
      const order = await api.createOrder({
        customer_id: parseInt(customerId, 10),
        items: lines
          .filter((l) => l.product_id)
          .map((l) => ({
            product_id: parseInt(l.product_id, 10),
            quantity: parseInt(l.quantity, 10),
          })),
      });
      navigate(`/orders/${order.id}`);
    }, 'Order created successfully');
  };

  return (
    <>
      <div className="page-header">
        <h1>Create Order</h1>
      </div>

      <Alert message={error} onClose={clearMessages} />
      <Alert type="success" message={success} onClose={clearMessages} />

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer">Customer</label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {fieldErrors.customer && (
              <small style={{ color: 'var(--danger)' }}>{fieldErrors.customer}</small>
            )}
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Order Items</h3>
          {fieldErrors.items && (
            <small style={{ color: 'var(--danger)', display: 'block', marginBottom: '0.5rem' }}>
              {fieldErrors.items}
            </small>
          )}

          {lines.map((line, index) => (
            <div key={index} className="order-line">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <select
                  value={line.product_id}
                  onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity_in_stock})
                    </option>
                  ))}
                </select>
                {fieldErrors[`line_${index}`] && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors[`line_${index}`]}</small>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Qty</label>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                />
                {fieldErrors[`qty_${index}`] && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors[`qty_${index}`]}</small>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeLine(index)}
                disabled={lines.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-ghost"
            onClick={addLine}
            style={{ marginBottom: '1rem' }}
          >
            + Add line
          </button>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Place Order
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/orders')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
