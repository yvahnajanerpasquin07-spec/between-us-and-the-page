import { supabase } from './supabase';

export async function getMyJournals() {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

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

export async function createJournal({
  title,
  description,
  coverImageUrl,
  coverColor,
  coverMaterial,
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from('journals')
    .insert({
      title,
      description: description ?? null,
      cover_image_url: coverImageUrl ?? null,
      cover_color: coverColor ?? '#2d2a26',
      cover_material: coverMaterial ?? 'kraft',
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