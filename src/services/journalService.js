import { supabase } from './supabase';


/* =========================================================
   GET MY JOURNALS
========================================================= */

export async function getMyJournals() {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data;
}


/* =========================================================
   GET SHARED JOURNALS
========================================================= */

export async function getSharedJournals() {
  const { data, error } = await supabase
    .from('shared_journals')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data;
}


/* =========================================================
   GET ONE JOURNAL
========================================================= */

export async function getJournal(journalId) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('id', journalId)
    .single();

  if (error) throw error;

  return data;
}


/* =========================================================
   CREATE JOURNAL
========================================================= */

export async function createJournal({
  title,
  description,
  coverImageUrl,
  coverColor,
  coverMaterial,
}) {
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from('journals')
    .insert({
      title,
      description:
        description ?? null,

      cover_image_url:
        coverImageUrl ?? null,

      cover_color:
        coverColor ?? '#2d2a26',

      cover_material:
        coverMaterial ?? 'kraft',

      owner_id:
        userData.user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}


/* =========================================================
   UPDATE JOURNAL
========================================================= */

export async function updateJournal(
  journalId,
  updates
) {
  const { data, error } = await supabase
    .from('journals')
    .update(updates)
    .eq('id', journalId)
    .select()
    .single();

  if (error) throw error;

  return data;
}


/* =========================================================
   DELETE JOURNAL
========================================================= */

export async function deleteJournal(
  journalId
) {
  const { error } = await supabase
    .from('journals')
    .delete()
    .eq('id', journalId);

  if (error) throw error;
}


/* =========================================================
   UPLOAD JOURNAL COVER IMAGE
========================================================= */

export async function uploadJournalCover(
  journalId,
  file
) {
  if (!file) {
    throw new Error(
      'No cover image selected.'
    );
  }

  const bucket =
    'journal-covers';


  /* -------------------------------------------------------
     Make filename safe
  ------------------------------------------------------- */

  const safeFileName =
    file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );


  const path =
    `${journalId}/${Date.now()}_${safeFileName}`;


  /* -------------------------------------------------------
     Upload
  ------------------------------------------------------- */

  const { error } =
    await supabase.storage
      .from(bucket)
      .upload(
        path,
        file,
        {
          upsert: false,
          contentType: file.type,
        }
      );

  if (error) {
    throw error;
  }


  /* -------------------------------------------------------
     Get PUBLIC URL
  ------------------------------------------------------- */

  const { data } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(path);


  if (!data?.publicUrl) {
    throw new Error(
      'Could not generate public cover image URL.'
    );
  }


  return data.publicUrl;
}


/* =========================================================
   SAVE JOURNAL COVER URL
========================================================= */

export async function updateJournalCoverImage(
  journalId,
  imageUrl
) {
  const { data, error } =
    await supabase
      .from('journals')
      .update({
        cover_image_url:
          imageUrl,
      })
      .eq('id', journalId)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}