import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const LINKS = [
  { to: '/vendors', label: 'Vendors' },
  { to: '/services', label: 'Services' },
  { to: '/bookings', label: 'Bookings' },
];

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-bold text-gray-900">SamanRent Admin</div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span data-testid="admin-email">{admin?.email}</span>
            <button
              type="button"
              data-testid="logout-button"
              onClick={onLogout}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
