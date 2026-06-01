import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import Alert from '../components/Alert';
import { useApi } from '../hooks/useApi';

const emptyForm = { full_name: '', email: '', phone: '' };

function validateCustomer(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (form.phone.trim().length < 5) errors.phone = 'Phone too short';
  return errors;
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const { loading, error, success, run, clearMessages } = useApi();

  const load = useCallback(() => {
    api.getCustomers().then(setCustomers).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCustomer(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    await run(async () => {
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setForm(emptyForm);
      setModalOpen(false);
      load();
    }, 'Customer created successfully');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await run(async () => {
      await api.deleteCustomer(id);
      load();
    }, 'Customer deleted');
  };

  return (
    <>
      <div className="page-header">
        <h1>Customers</h1>
        <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          Add Customer
        </button>
      </div>

      <Alert message={error} onClose={clearMessages} />
      <Alert type="success" message={success} onClose={clearMessages} />

      <div className="card table-wrap">
        {customers.length === 0 ? (
          <p className="empty">No customers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td className="col-actions">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
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
            <h2>Add Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
                {fieldErrors.full_name && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors.full_name}</small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {fieldErrors.email && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors.email}</small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {fieldErrors.phone && (
                  <small style={{ color: 'var(--danger)' }}>{fieldErrors.phone}</small>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create
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
