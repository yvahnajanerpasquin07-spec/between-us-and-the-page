import { supabase } from './supabase';


/* =========================================================
   CHECK CURRENT USER ADMIN STATUS
========================================================= */

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc(
    'is_current_user_admin'
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}


/* =========================================================
   GET ADMIN EMAILS
========================================================= */

export async function getAdminEmails() {
  const { data, error } = await supabase
    .from('admin_emails')
    .select('id, email, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}


/* =========================================================
   ADD ADMIN EMAIL
========================================================= */

export async function addAdminEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.endsWith('@gmail.com')) {
    throw new Error(
      'Please enter a Gmail address ending in @gmail.com.'
    );
  }

  const { data, error } = await supabase
    .from('admin_emails')
    .insert({
      email: normalizedEmail,
    })
    .select('id, email, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        'That Gmail account is already an admin.'
      );
    }

    throw error;
  }

  return data;
}


/* =========================================================
   REMOVE ADMIN EMAIL
========================================================= */

export async function removeAdminEmail(id) {
  const { error } = await supabase
    .from('admin_emails')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}