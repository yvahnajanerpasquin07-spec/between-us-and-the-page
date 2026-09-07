import { supabase } from './supabase';


/* =========================================================
   GET THE URL WHERE USERS SHOULD GO AFTER CONFIRMING EMAIL
========================================================= */

function getEmailRedirectUrl() {
  /*
    The project uses HashRouter.

    Development:
    http://localhost:5173/#/dashboard

    Production:
    https://your-site.com/between-us-and-the-page/#/dashboard
  */

  return `${window.location.origin}${import.meta.env.BASE_URL}#/dashboard`;
}


/* =========================================================
   SIGN UP
========================================================= */

export async function signUp(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email: cleanEmail,
    password,

    options: {
      /*
        Supabase will send the confirmation email.

        After the user clicks the confirmation link,
        they will be redirected back to the dashboard.
      */
      emailRedirectTo: getEmailRedirectUrl(),
    },
  });


  if (error) {
    throw error;
  }


  return data;
}


/* =========================================================
   SIGN IN
========================================================= */

export async function signIn(email, password) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });


  if (error) {
    throw error;
  }


  return data;
}


/* =========================================================
   SIGN OUT
========================================================= */

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();


  if (error) {
    throw error;
  }
}


/* =========================================================
   RESET PASSWORD
========================================================= */

export async function resetPassword(email) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );


  if (error) {
    throw error;
  }
}


/* =========================================================
   GET CURRENT SESSION
========================================================= */

export async function getSession() {
  const {
    data,
    error,
  } = await supabase.auth.getSession();


  if (error) {
    throw error;
  }


  return data.session;
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

export function onAuthStateChange(callback) {

  const {
    data: listener,
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );


  return () =>
    listener.subscription.unsubscribe();
}