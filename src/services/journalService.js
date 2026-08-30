import { supabase } from './supabase';

// Journals the current user owns.
export async function getMyJournals() {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Journals shared with the current user as a view-only reader.
// Relies on the `shared_journals` view defined in schema.sql.
export async function getSharedJournals() {
  const { data, error } = await supabase
    .from('shared_journals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getJournal(journalId) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('id', journalId)
    .single();
  if (error) throw error;
  return data;
}

export async function createJournal({ title, description, coverImageUrl }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from('journals')
    .insert({
      title,
      description: description ?? null,
      cover_image_url: coverImageUrl ?? null,
      owner_id: userData.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJournal(journalId, updates) {
  const { data, error } = await supabase
    .from('journals')
    .update(updates)
    .eq('id', journalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJournal(journalId) {
  const { error } = await supabase.from('journals').delete().eq('id', journalId);
  if (error) throw error;
}
