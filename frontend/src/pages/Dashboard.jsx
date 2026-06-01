import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getDashboard()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert message={error} />;

  if (!summary) {
    return <p className="empty">Loading dashboard...</p>;
  }

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{summary.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{summary.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{summary.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value" style={{ color: 'var(--warning)' }}>
            {summary.low_stock_products.length}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Low Stock Products (≤ 10 units)</h2>
        {summary.low_stock_products.length === 0 ? (
          <p className="empty">All products are well stocked.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className="badge badge-warning">{p.quantity_in_stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: '1rem' }}>
          <Link to="/products" style={{ color: 'var(--primary)' }}>
            Manage products →
          </Link>
        </p>
      </div>
    </>
  );
}
