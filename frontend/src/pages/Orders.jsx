import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';
import { useApi } from '../hooks/useApi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const { loading, error: actionError, success, run, clearMessages } = useApi();

  const load = useCallback(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel/delete this order? Stock will be restored.')) return;
    await run(async () => {
      await api.deleteOrder(id);
      load();
    }, 'Order cancelled and stock restored');
  };

  return (
    <>
      <div className="page-header">
        <h1>Orders</h1>
        <Link to="/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      <Alert message={error || actionError} onClose={() => { setError(''); clearMessages(); }} />
      <Alert type="success" message={success} onClose={clearMessages} />

      <div className="card table-wrap">
        {orders.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <span className="cell-primary">{o.customer_name || '—'}</span>
                    {o.customer_email && (
                      <span className="cell-secondary">{o.customer_email}</span>
                    )}
                  </td>
                  <td>{o.items?.length ?? 0} item(s)</td>
                  <td className="cell-amount">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="cell-date">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="col-actions">
                    <div className="table-actions">
                      <Link
                        to={`/orders/${o.id}`}
                        className="btn btn-ghost btn-sm"
                        title={`View order #${o.id}`}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(o.id)}
                        disabled={loading}
                        title={`Cancel order #${o.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
