import { useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import AdminEmployees from '../components/AdminEmployees';

const TOKEN_KEY = 'khushi_hr_admin_token';

type Section = 'timesheet' | 'employees';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'timesheet', label: 'Timesheet' },
  { value: 'employees', label: 'Employees' },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [section, setSection] = useState<Section>('timesheet');

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">
            Khushi <span>HR</span>
          </h1>
          <p className="app__subtitle">Admin dashboard</p>
        </div>
        <div className="admin-header__right">
          <nav className="admin-nav">
            {SECTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`admin-nav__btn ${section === s.value ? 'admin-nav__btn--active' : ''}`}
                onClick={() => setSection(s.value)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <button type="button" className="btn btn--gold" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <main className="app__main">
        {section === 'timesheet' ? (
          <AdminDashboard token={token} onLogout={handleLogout} />
        ) : (
          <AdminEmployees token={token} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}
