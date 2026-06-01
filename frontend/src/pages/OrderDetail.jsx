import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getOrder(id)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Alert message={error} />;
  if (!order) return <p className="empty">Loading order...</p>;

  return (
    <>
      <div className="page-header">
        <h1>Order #{order.id}</h1>
        <Link to="/orders" className="btn btn-ghost">
          ← Back to orders
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p>
          <strong>Customer:</strong> {order.customer_name} ({order.customer_email})
        </p>
        <p>
          <strong>Total:</strong> ${order.total_amount.toFixed(2)}
        </p>
        <p>
          <strong>Date:</strong>{' '}
          {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
        </p>
      </div>

      <div className="card table-wrap">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Line Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.product_sku}</td>
                <td>{item.quantity}</td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td>${item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
