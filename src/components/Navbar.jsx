import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfileSidebar from './UserProfileSidebar';
import ExploreSidebar from './ExploreSidebar';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    exploreOpen,
    setExploreOpen,
  ] = useState(false);


  /* =======================================================
     SIGN OUT
  ======================================================= */

  async function handleSignOut() {

    await signOut();

    setProfileOpen(false);

    navigate('/login');

  }


  return (
    <>
      <header className="border-b border-ink/15 bg-paper/90 backdrop-blur">

        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          {/* =================================================
              SITE TITLE
          ================================================= */}

          <Link
            to="/"
            className="font-display text-xl italic text-ink"
          >
            Between Us and the Page
          </Link>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="flex items-center gap-3">

            {!user && (

              <button
                type="button"
                onClick={() => setExploreOpen(true)}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-ink/20
                  text-ink
                  transition
                  hover:bg-ink
                  hover:text-paper
                "
                aria-label="Explore"
                title="Explore"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3.5l1.15 5.35L18.5 10l-5.35 1.15L12 16.5l-1.15-5.35L5.5 10l5.35-1.15L12 3.5Z" />
                  <path d="M18.5 15.5l.55 2.45 2.45.55-2.45.55-.55 2.45-.55-2.45-2.45-.55 2.45-.55.55-2.45Z" />
                </svg>
              </button>

            )}

            {user && (

              <>

                {/* =================================================
                    MY LIBRARY ICON
                ================================================= */}

                <Link
                  to="/dashboard"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-ink/20
                    text-ink
                    transition
                    hover:bg-ink
                    hover:text-paper
                  "
                  aria-label="My Library"
                  title="My Library"
                >

                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    {/* BOOK */}

                    <path
                      d="
                        M4.5 5.5
                        A2 2 0 0 1 6.5 3.5
                        H11
                        A2 2 0 0 1 13 5.5
                        V20
                        A2 2 0 0 0 11 18
                        H6.5
                        A2 2 0 0 0 4.5 20
                        Z
                      "
                    />

                    <path
                      d="
                        M19.5 5.5
                        A2 2 0 0 0 17.5 3.5
                        H13
                        A2 2 0 0 0 11 5.5
                        V20
                        A2 2 0 0 1 13 18
                        H17.5
                        A2 2 0 0 1 19.5 20
                        Z
                      "
                    />

                  </svg>

                </Link>


                {/* =================================================
                    PROFILE ICON
                ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(true)
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-ink/20
                    text-ink
                    transition
                    hover:bg-ink
                    hover:text-paper
                  "
                  aria-label="Open user profile"
                  title="Profile"
                >

                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >

                    <circle
                      cx="12"
                      cy="8"
                      r="3.2"
                    />

                    <path
                      d="
                        M5.5 19.2
                        c.8-3.1
                        3.2-5
                        6.5-5
                        s5.7 1.9
                        6.5 5
                      "
                      strokeLinecap="round"
                    />

                  </svg>

                </button>

              </>

            )}

          </div>

        </nav>

      </header>


      {/* =====================================================
          EXPLORE SIDEBAR
      ===================================================== */}

      {!user && (

        <ExploreSidebar
          open={exploreOpen}
          onClose={() => setExploreOpen(false)}
        />

      )}


      {/* =====================================================
          USER PROFILE SIDEBAR
      ===================================================== */}

      {user && (

        <UserProfileSidebar
          open={profileOpen}
          onClose={() =>
            setProfileOpen(false)
          }
          onSignOut={handleSignOut}
          user={user}
        />

      )}

    </>
  );
}