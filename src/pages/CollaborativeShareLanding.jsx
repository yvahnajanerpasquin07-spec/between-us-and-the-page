import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { acceptEditorShareToken } from '../services/shareService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function CollaborativeShareLanding() {
  const { editorToken } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !editorToken) return;

    if (!user) {
      // Keep the token so Login can return here after authentication.
      localStorage.setItem('pendingEditorShareToken', editorToken);
      navigate('/login', { replace: true });
      return;
    }

    let active = true;

    acceptEditorShareToken(editorToken)
      .then((journalId) => {
        if (!active) return;
        localStorage.removeItem('pendingEditorShareToken');
        navigate(`/journal/${journalId}`, { replace: true });
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err?.message ||
          'This editor link is invalid or has expired.'
        );
      });

    return () => {
      active = false;
    };
  }, [authLoading, editorToken, user, navigate]);

  if (authLoading || !error) {
    return <Loading label="Opening shared journal" />;
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="mb-3 font-display text-2xl">Unable to open journal</h1>
      <p className="font-body text-sm text-ink-soft">{error}</p>
    </div>
  );
}
