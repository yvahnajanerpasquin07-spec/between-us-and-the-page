import { supabase } from './supabase';


/* =========================================================
   GET MY JOURNALS
========================================================= */

export async function getMyJournals() {
  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   GET SHARED JOURNALS
========================================================= */

export async function getSharedJournals() {
  const {
    data,
    error,
  } = await supabase
    .from('shared_journals')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   GET ONE JOURNAL
========================================================= */

export async function getJournal(
  journalId
) {
  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .select('*')
    .eq(
      'id',
      journalId
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   CREATE JOURNAL
========================================================= */

export async function createJournal({
  title,
  description,
  authorName,
  journalDate,
  coverColor,
  coverMaterial,
  spineColor,
}) {
  const {
    data: userData,
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .insert({

      /*
        Title is optional.
      */

      title:
        title?.trim() ||
        null,


      /*
        Description is optional.
      */

      description:
        description?.trim() ||
        null,


      /*
        Author is optional.
      */

      author_name:
        authorName?.trim() ||
        null,


      /*
        Date is optional.
        No automatic date is used.
      */

      journal_date:
        journalDate ||
        null,


      /*
        Images are uploaded after
        the journal is created.
      */

      cover_image_url:
        null,

      cover_back_image_url:
        null,


      /*
        Front cover color.
      */

      cover_color:
        coverColor ||
        '#c9a876',


      /*
        Book texture/material.
      */

      cover_material:
        coverMaterial ||
        'kraft',


      /*
        Spine color.
      */

      spine_color:
        spineColor ||
        '#8a6f47',


      owner_id:
        userData.user.id,

    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   UPDATE JOURNAL
========================================================= */

export async function updateJournal(
  journalId,
  updates
) {
  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .update(updates)
    .eq(
      'id',
      journalId
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   DELETE JOURNAL
========================================================= */

export async function deleteJournal(
  journalId
) {
  const {
    error,
  } = await supabase
    .from('journals')
    .delete()
    .eq(
      'id',
      journalId
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPLOAD JOURNAL COVER IMAGE
   ---------------------------------------------------------
   side:
   - front
   - back
========================================================= */

export async function uploadJournalCover(
  journalId,
  file,
  side = 'front'
) {
  if (!file) {
    throw new Error(
      'No cover image selected.'
    );
  }

  const bucket =
    'journal-covers';


  /*
    Make the filename safe.
  */

  const safeFileName =
    file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );


  const path =
    `${journalId}/${side}_${Date.now()}_${safeFileName}`;


  /*
    Upload the image.
  */

  const {
    error,
  } =
    await supabase.storage
      .from(bucket)
      .upload(
        path,
        file,
        {
          upsert: false,

          contentType:
            file.type ||
            'image/jpeg',
        }
      );

  if (error) {
    throw error;
  }


  /*
    Get the public URL.
  */

  const {
    data,
  } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(
        path
      );

  if (!data?.publicUrl) {
    throw new Error(
      'Could not generate public cover image URL.'
    );
  }

  return data.publicUrl;
}


/* =========================================================
   SAVE FRONT + BACK COVER URLS
========================================================= */

export async function updateJournalCoverImages(
  journalId,
  frontImageUrl,
  backImageUrl
) {
  const updates = {};

  if (frontImageUrl) {
    updates.cover_image_url =
      frontImageUrl;
  }

  if (backImageUrl) {
    updates.cover_back_image_url =
      backImageUrl;
  }

  if (
    !Object.keys(updates).length
  ) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from('journals')
      .update(updates)
      .eq(
        'id',
        journalId
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   SAVE FRONT COVER URL
   ---------------------------------------------------------
   Kept for compatibility with existing code.
========================================================= */

export async function updateJournalCoverImage(
  journalId,
  imageUrl
) {
  return updateJournalCoverImages(
    journalId,
    imageUrl,
    null
  );
}


/* =========================================================
   GET PUBLIC JOURNAL BY SHARE TOKEN
   ---------------------------------------------------------
   Used by the view-only public sharing link.
========================================================= */

export async function getPublicJournal(
  shareToken
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'get_public_journal',
    {
      p_share_token:
        shareToken,
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.journal) {
    return null;
  }

  return data.journal;
}


/* =========================================================
   GET PUBLIC POEMS BY SHARE TOKEN
   ---------------------------------------------------------
   Used by the view-only public sharing link.
========================================================= */

export async function getPublicPoems(
  shareToken
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'get_public_journal',
    {
      p_share_token:
        shareToken,
    }
  );

  if (error) {
    throw error;
  }

  return data?.poems ?? [];
}