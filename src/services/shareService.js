import { supabase } from './supabase';

export async function getSharesForJournal(journalId) {
  const { data, error } = await supabase
    .from('journal_access')
    .select('id, viewer_id, created_at, profiles:viewer_id (email)')
    .eq('journal_id', journalId);

  if (error) throw error;

  return data;
}

// Looks up a registered user by email so an owner can share by address
// rather than by internal id. Requires the `profiles` table/view described
// in schema.sql.
export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function shareJournal(journalId, viewerId) {
  const { data, error } = await supabase
    .from('journal_access')
    .insert({
      journal_id: journalId,
      viewer_id: viewerId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function revokeShare(journalAccessId) {
  const { error } = await supabase
    .from('journal_access')
    .delete()
    .eq('id', journalAccessId);

  if (error) throw error;
}


/* =========================================================
   CREATE / GET PUBLIC VIEW-ONLY SHARE TOKEN
========================================================= */

export async function getOrCreatePublicShareToken(
  journalId
) {
  const {
    data: journal,
    error: fetchError,
  } = await supabase
    .from('journals')
    .select('id, public_share_token')
    .eq('id', journalId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  /*
    If this journal already has a public share token,
    use the existing token instead of creating a new one.
  */

  if (journal.public_share_token) {
    return journal.public_share_token;
  }

  /*
    Create a unique token for the public view-only link.
  */

  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .update({
      public_share_token: crypto.randomUUID(),
    })
    .eq('id', journalId)
    .select('public_share_token')
    .single();

  if (error) {
    throw error;
  }

  return data.public_share_token;
}