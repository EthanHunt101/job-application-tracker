import { useState } from 'react';
import { api } from '../api/client';

const STATUSES = ['applied', 'oa', 'phone_screen', 'onsite', 'offer', 'rejected'];

function ApplicationList({ applications, onChange }) {
  const [error, setError] = useState('');

  async function handleStatusChange(app, status) {
    setError('');
    try {
      const { application } = await api.updateApplication(app.id, { status });
      onChange((prev) => prev.map((a) => (a.id === application.id ? application : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(app) {
    setError('');
    try {
      await api.deleteApplication(app.id);
      onChange((prev) => prev.filter((a) => a.id !== app.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (applications.length === 0) {
    return <p>No applications yet — add your first one above.</p>;
  }

  return (
    <div className="card">
      <h2>Your applications</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Date applied</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.company}</td>
              <td>{app.role}</td>
              <td>
                <select value={app.status} onChange={(e) => handleStatusChange(app, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td>{new Date(app.date_applied).toLocaleDateString()}</td>
              <td>
                <button type="button" onClick={() => handleDelete(app)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationList;
