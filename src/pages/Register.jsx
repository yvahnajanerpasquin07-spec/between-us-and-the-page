import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import Button from '../components/Button';
import Input from '../components/Input';


/* =========================================================
   PASSWORD REQUIREMENTS
========================================================= */

const passwordRequirements = [
  {
    key: 'length',
    label: 'At least 8 characters',
    test: (password) =>
      password.length >= 8,
  },

  {
    key: 'lowercase',
    label: 'One lowercase letter',
    test: (password) =>
      /[a-z]/.test(password),
  },

  {
    key: 'uppercase',
    label: 'One uppercase letter',
    test: (password) =>
      /[A-Z]/.test(password),
  },

  {
    key: 'number',
    label: 'One number',
    test: (password) =>
      /[0-9]/.test(password),
  },

  {
    key: 'symbol',
    label: 'One symbol',
    test: (password) =>
      /[^A-Za-z0-9\s]/.test(password),
  },
];


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


/* =========================================================
   REGISTER PAGE
========================================================= */

export default function Register() {

  const { signUp } = useAuth();

  const navigate = useNavigate();


  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [registeredEmail, setRegisteredEmail] =
    useState('');


  /* =======================================================
     CHECK PASSWORD REQUIREMENTS
  ======================================================= */

  const passwordChecks =
    passwordRequirements.map(
      (requirement) => ({
        ...requirement,
        valid: requirement.test(password),
      })
    );


  const passwordIsValid =
    passwordChecks.every(
      (requirement) => requirement.valid
    );


  /* =======================================================
     HANDLE REGISTRATION
  ======================================================= */

  async function handleSubmit(event) {

    event.preventDefault();

    setError(null);


    const cleanEmail =
      email.trim().toLowerCase();


    /* -------------------------------------------------------
       EMAIL VALIDATION
    ------------------------------------------------------- */

    if (!cleanEmail) {

      setError(
        'Please enter your email address.'
      );

      return;
    }


    if (!isValidEmail(cleanEmail)) {

      setError(
        'Please enter a valid email address.'
      );

      return;
    }


    /* -------------------------------------------------------
       PASSWORD VALIDATION
    ------------------------------------------------------- */

    if (!passwordIsValid) {

      setError(
        'Please make sure your password meets all of the requirements.'
      );

      return;
    }


    setSubmitting(true);


    try {

      const data =
        await signUp(
          cleanEmail,
          password
        );


      /*
        If Supabase returns a session immediately,
        email confirmation is disabled.

        In that case, the user can go straight
        to the dashboard.
      */

      if (data?.session) {

        navigate('/dashboard');

        return;
      }


      /*
        If there is no session, email confirmation
        is enabled.

        Show the confirmation message instead
        of sending the user to the dashboard.
      */

      setRegisteredEmail(
        cleanEmail
      );


    } catch (err) {

      console.error(
        'Registration error:',
        err
      );


      /* ---------------------------------------------------
         FRIENDLY ERROR MESSAGES
      --------------------------------------------------- */

      const message =
        err?.message?.toLowerCase() || '';


      if (
        message.includes(
          'invalid email'
        ) ||
        message.includes(
          'email address'
        )
      ) {

        setError(
          'Please enter a valid email address.'
        );

      } else if (
        message.includes(
          'password'
        ) &&
        (
          message.includes(
            'weak'
          ) ||
          message.includes(
            'strength'
          )
        )
      ) {

        setError(
          'Your password is too weak. Please meet all of the password requirements.'
        );

      } else if (
        message.includes(
          'already registered'
        ) ||
        message.includes(
          'already been registered'
        )
      ) {

        setError(
          'This email is already registered. Try logging in instead.'
        );

      } else if (
        message.includes(
          'rate limit'
        ) ||
        message.includes(
          'too many requests'
        )
      ) {

        setError(
          'Too many registration attempts. Please wait a little while and try again.'
        );

      } else if (
        message.includes(
          'email not authorized'
        )
      ) {

        setError(
          'This email cannot receive confirmation emails yet. Please check your Supabase email settings.'
        );

      } else {

        setError(
          err?.message ||
          'Something went wrong while creating your account. Please try again.'
        );

      }

    } finally {

      setSubmitting(false);

    }
  }


  /* =======================================================
     EMAIL CONFIRMATION SCREEN
  ======================================================= */

  if (registeredEmail) {

    return (
      <div
        className="
          mx-auto
          flex
          max-w-sm
          flex-col
          gap-6
          px-6
          py-20
        "
      >

        {/* -------------------------------------------------
            ICON
        ------------------------------------------------- */}

        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border
            border-ink-soft/20
            bg-paper
          "
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-ink"
          >

            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
            />

            <path d="m3 7 9 6 9-6" />

          </svg>

        </div>


        {/* -------------------------------------------------
            MESSAGE
        ------------------------------------------------- */}

        <div>

          <p
            className="
              font-mono
              text-xs
              uppercase
              tracking-[0.18em]
              text-ink-soft
            "
          >
            Almost there
          </p>


          <h1
            className="
              mt-2
              font-display
              text-2xl
            "
          >
            Check your email
          </h1>


          <p
            className="
              mt-3
              font-body
              text-sm
              leading-6
              text-ink-soft
            "
          >
            We sent a confirmation link to:
          </p>


          <p
            className="
              mt-2
              break-all
              font-mono
              text-sm
              text-ink
            "
          >
            {registeredEmail}
          </p>


          <p
            className="
              mt-4
              font-body
              text-sm
              leading-6
              text-ink-soft
            "
          >
            Open the email and click the
            confirmation link to finish creating
            your account.
          </p>

        </div>


        {/* -------------------------------------------------
            LOGIN BUTTON
        ------------------------------------------------- */}

        <Button
          type="button"
          onClick={() =>
            navigate('/login')
          }
        >
          Go to login
        </Button>


        {/* -------------------------------------------------
            BACK TO REGISTER
        ------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {

            setRegisteredEmail('');
            setEmail('');
            setPassword('');
            setError(null);

          }}
          className="
            font-body
            text-sm
            text-ink-soft
            hover:text-ink
            hover:underline
          "
        >
          Use a different email
        </button>

      </div>
    );
  }


  /* =======================================================
     REGISTRATION FORM
  ======================================================= */

  return (
    <div
      className="
        mx-auto
        flex
        max-w-sm
        flex-col
        gap-6
        px-6
        py-20
      "
    >

      <div>

        <h1
          className="
            font-display
            text-2xl
          "
        >
          Create your journal
        </h1>


        <p
          className="
            mt-2
            font-body
            text-sm
            text-ink-soft
          "
        >
          Create an account to start
          your own journal.
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="
          flex
          flex-col
          gap-4
        "
      >

        {/* =================================================
            EMAIL
        ================================================= */}

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {

            setEmail(
              event.target.value
            );

            setError(null);

          }}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />


        {/* =================================================
            PASSWORD
        ================================================= */}

        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => {

            setPassword(
              event.target.value
            );

            setError(null);

          }}
          autoComplete="new-password"
          placeholder="Create a strong password"
          minLength={8}
          required
        />


        {/* =================================================
            PASSWORD REQUIREMENTS
        ================================================= */}

        <div
          className="
            rounded-md
            border
            border-ink-soft/15
            bg-paper/60
            px-3
            py-3
          "
        >

          <p
            className="
              mb-2
              font-mono
              text-[11px]
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Password must have
          </p>


          <div
            className="
              flex
              flex-col
              gap-1.5
            "
          >

            {passwordChecks.map(
              (requirement) => (

                <div
                  key={requirement.key}
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                  "
                >

                  <span
                    className={`
                      flex
                      h-4
                      w-4
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      text-[10px]
                      ${
                        requirement.valid
                          ? 'border-ink bg-ink text-paper'
                          : 'border-ink-soft/30 text-ink-soft/40'
                      }
                    `}
                  >

                    {requirement.valid
                      ? '✓'
                      : ''}

                  </span>


                  <span
                    className={
                      requirement.valid
                        ? 'text-ink'
                        : 'text-ink-soft'
                    }
                  >
                    {requirement.label}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div
            className="
              rounded-md
              border
              border-red-900/15
              bg-red-50/50
              px-3
              py-2.5
            "
          >

            <p
              className="
                text-sm
                leading-5
                text-red-900/75
              "
            >
              {error}
            </p>

          </div>

        )}


        {/* =================================================
            REGISTER BUTTON
        ================================================= */}

        <Button
          type="submit"
          disabled={
            submitting ||
            !passwordIsValid
          }
        >
          {submitting
            ? 'Creating account…'
            : 'Register'}
        </Button>

      </form>


      {/* =================================================
          LOGIN LINK
      ================================================= */}

      <p
        className="
          font-body
          text-sm
          text-ink-soft
        "
      >
        Already have an account?{' '}

        <Link
          to="/login"
          className="
            text-margin
            hover:underline
          "
        >
          Log in
        </Link>

      </p>

    </div>
  );
}