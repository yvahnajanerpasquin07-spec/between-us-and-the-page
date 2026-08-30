import { supabase } from './supabase';

export async function getPoemsForJournal(journalId) {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('journal_id', journalId)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPoem(poemId) {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', poemId)
    .single();
  if (error) throw error;
  return data;
}

export async function createPoem({ journalId, title, content, poemDate, spotifyUrl, displayOrder }) {
  const { data, error } = await supabase
    .from('poems')
    .insert({
      journal_id: journalId,
      title,
      content,
      poem_date: poemDate ?? null,
      spotify_url: spotifyUrl ?? null,
      display_order: displayOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePoem(poemId, updates) {
  const { data, error } = await supabase
    .from('poems')
    .update(updates)
    .eq('id', poemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePoem(poemId) {
  const { error } = await supabase.from('poems').delete().eq('id', poemId);
  if (error) throw error;
}

export async function reorderPoems(orderedUpdates) {
  // orderedUpdates: [{ id, display_order }, ...]
  const { error } = await supabase.from('poems').upsert(orderedUpdates);
  if (error) throw error;
}
