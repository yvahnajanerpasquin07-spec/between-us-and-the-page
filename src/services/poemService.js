import { supabase } from './supabase';

/* =========================================================
   GET ALL POEMS FOR A JOURNAL
========================================================= */

export async function getPoemsForJournal(journalId) {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('journal_id', journalId)
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   GET ONE POEM
========================================================= */

export async function getPoem(poemId) {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', poemId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   CREATE POEM
========================================================= */

export async function createPoem({
  journalId,
  title,
  content,
  poemDate,
  spotifyUrl,
  displayOrder,
}) {
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

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   UPDATE POEM
========================================================= */

export async function updatePoem(poemId, updates) {
  const { data, error } = await supabase
    .from('poems')
    .update(updates)
    .eq('id', poemId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   DELETE POEM
========================================================= */

export async function deletePoem(poemId) {
  const { error } = await supabase
    .from('poems')
    .delete()
    .eq('id', poemId);

  if (error) {
    throw error;
  }
}


/* =========================================================
   REORDER POEMS
========================================================= */

export async function reorderPoems(orderedUpdates) {
  /*
    Example:

    [
      {
        id: 'poem-id',
        display_order: 0
      },
      {
        id: 'another-poem-id',
        display_order: 1
      }
    ]
  */

  const { error } = await supabase
    .from('poems')
    .upsert(orderedUpdates);

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPDATE SPOTIFY WIDGET POSITION
========================================================= */

export async function updatePoemWidgetBox(poemId, box) {
  const { error } = await supabase
    .from('poems')
    .update({
      spotify_widget_box: box,
    })
    .eq('id', poemId);

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPLOAD POEM IMAGE
========================================================= */

export async function uploadPoemImage(
  journalId,
  poemId,
  file
) {
  if (!file) {
    throw new Error('No image file was selected.');
  }

  const bucket = 'poem-images';

  /*
    Remove special characters from the filename.
    This helps avoid storage path problems.
  */

  const safeFileName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    '_'
  );

  const path =
    `${journalId}/${poemId}/${Date.now()}_${safeFileName}`;


  /*
    Upload image to Supabase Storage.
  */

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(
      path,
      file,
      {
        upsert: true,
        contentType: file.type,
      }
    );

  if (error) {
    throw error;
  }


  /*
    IMPORTANT:

    Supabase JS returns:

      data.publicUrl

    NOT:

      data.publicURL
  */

  const {
    data: publicUrlData,
  } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path);


  const publicUrl =
    publicUrlData?.publicUrl;


  if (!publicUrl) {
    throw new Error(
      'Image uploaded, but Supabase did not return a public URL.'
    );
  }


  /*
    Return the image URL so the page can
    immediately display it.
  */

  return publicUrl;
}


/* =========================================================
   SAVE POEM IMAGE URL
========================================================= */

export async function updatePoemImage(
  poemId,
  imageUrl
) {
  const { data, error } = await supabase
    .from('poems')
    .update({
      image_url: imageUrl,
    })
    .eq('id', poemId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   UPDATE POEM IMAGE WIDGET POSITION
========================================================= */

export async function updatePoemImageBox(
  poemId,
  box
) {
  const { error } = await supabase
    .from('poems')
    .update({
      image_widget_box: box,
    })
    .eq('id', poemId);

  if (error) {
    throw error;
  }
}