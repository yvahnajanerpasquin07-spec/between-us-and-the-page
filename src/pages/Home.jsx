import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
      <span className="font-hand text-3xl text-margin">a notebook, kept online</span>
      <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
        Write your poems.
        <br />
        Set them to music.
        <br />
        Share them on your terms.
      </h1>
      <p className="max-w-md font-body text-ink-soft">
        Between Us and the Page is a private space for writing and organizing poetry —
        with a song attached to every page, and sharing that stays view-only unless
        you say otherwise.
      </p>
      <Link to={user ? '/dashboard' : '/register'} className="btn-primary">
        {user ? 'Go to my library' : 'Start your first journal'}
      </Link>
    </div>
  );
}
