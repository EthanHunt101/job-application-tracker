import { useState } from 'react';
import { api } from '../api/client';

function ApplicationForm({ onCreated }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { application } = await api.createApplication({
        company,
        role,
        job_link: jobLink || undefined,
      });
      onCreated(application);
      setCompany('');
      setRole('');
      setJobLink('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Open a New File</h2>
      {error && <p className="error">{error}</p>}
      <div className="field-row">
        <label>
          Company
          <input value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="e.g. Acme Corp" />
        </label>
        <label>
          Role
          <input value={role} onChange={(e) => setRole(e.target.value)} required placeholder="e.g. SWE Intern" />
        </label>
      </div>
      <label>
        Job link (optional)
        <input
          value={jobLink}
          onChange={(e) => setJobLink(e.target.value)}
          placeholder="https://…"
        />
      </label>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Filing…' : 'File it'}
      </button>
    </form>
  );
}

export default ApplicationForm;
