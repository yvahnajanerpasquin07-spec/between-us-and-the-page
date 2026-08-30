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
    .insert({ journal_id: journalId, viewer_id: viewerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function revokeShare(journalAccessId) {
  const { error } = await supabase.from('journal_access').delete().eq('id', journalAccessId);
  if (error) throw error;
}
