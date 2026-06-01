export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ float: 'right', padding: '0.2rem 0.5rem', marginTop: '-0.2rem' }}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
