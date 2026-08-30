import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <header className="border-b border-ink/15 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl italic text-ink">
          Between Us and the Page
        </Link>
        <div className="flex items-center gap-5 font-mono text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-margin">
                My Library
              </Link>
              <button onClick={handleSignOut} className="hover:text-margin">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-margin">
                Log in
              </Link>
              <Link to="/register" className="hover:text-margin">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
