import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { api } from '../api/client';
import { dateToInputValue, parseApiDate } from '../utils/date';

const STATUSES = ['applied', 'oa', 'phone_screen', 'onsite', 'offer', 'rejected'];

const STATUS_LABELS = {
  applied: 'Applied',
  oa: 'OA',
  phone_screen: 'Phone screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected',
};

function formatCaseNo(n) {
  return `No. ${String(n).padStart(3, '0')}`;
}

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

  async function handleDateChange(app, date) {
    setError('');
    try {
      const { application } = await api.updateApplication(app.id, { date_applied: dateToInputValue(date) });
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
    return <p className="empty-state">No files yet — open your first one above.</p>;
  }

  return (
    <div className="card ledger">
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Filed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={app.id}>
              <td className="case-no">{formatCaseNo(applications.length - index)}</td>
              <td className="company-cell">
                {app.job_link ? (
                  <a href={app.job_link} target="_blank" rel="noreferrer">
                    {app.company}
                  </a>
                ) : (
                  app.company
                )}
              </td>
              <td className="role-cell">{app.role}</td>
              <td>
                <select
                  className="stamp-select"
                  data-status={app.status}
                  value={app.status}
                  onChange={(e) => handleStatusChange(app, e.target.value)}
                  aria-label={`Status for ${app.company}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="date-cell">
                <DatePicker
                  selected={parseApiDate(app.date_applied)}
                  onChange={(date) => handleDateChange(app, date)}
                  dateFormat="MMM d, yyyy"
                  maxDate={new Date()}
                  className="date-input date-input-compact"
                  calendarClassName="dossier-datepicker"
                  popperPlacement="bottom-end"
                  aria-label={`Date applied for ${app.company}`}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn-close-file"
                  onClick={() => handleDelete(app)}
                  aria-label={`Close file for ${app.company}`}
                  title="Close file"
                >
                  Close
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
