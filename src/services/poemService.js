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

export async function updatePoemWidgetBox(poemId, box) {
  const { error } = await supabase
    .from('poems')
    .update({ spotify_widget_box: box })
    .eq('id', poemId);
  if (error) throw error;
}

export async function uploadPoemImage(journalId, poemId, file) {
  const bucket = 'poem-images';
  const path = `${journalId}/${poemId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { publicURL } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicURL;
}

export async function updatePoemImageBox(poemId, box) {
  const { error } = await supabase
    .from('poems')
    .update({ image_widget_box: box })
    .eq('id', poemId);
  if (error) throw error;
}