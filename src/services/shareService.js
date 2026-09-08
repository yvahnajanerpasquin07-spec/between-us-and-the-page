import { supabase } from './supabase';

export async function getSharesForJournal(journalId) {
  const { data, error } = await supabase
    .from('journal_access')
    .select('id, viewer_id, role, created_at, profiles:viewer_id (email)')
    .eq('journal_id', journalId)
    .order('created_at', { ascending: false });

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


/* =========================================================
   SHARE JOURNAL WITH REGISTERED USER
   ---------------------------------------------------------
   Uses a secure database function so both viewer and editor
   shares are created correctly even with RLS enabled.
========================================================= */

export async function shareJournal(
  journalId,
  viewerId,
  role = 'viewer'
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'share_journal_with_user',
    {
      p_journal_id: journalId,
      p_viewer_id: viewerId,
      p_role: role,
    }
  );

  if (error) throw error;

  return data;
}


export async function updateShareRole(
  journalAccessId,
  role
) {
  const { data, error } = await supabase
    .from('journal_access')
    .update({ role })
    .eq('id', journalAccessId)
    .select()
    .single();

  if (error) throw error;

  return data;
}


export async function getMyJournalAccess(
  journalId
) {
  const { data, error } = await supabase
    .from('journal_access')
    .select('id, journal_id, viewer_id, role')
    .eq(
      'journal_id',
      journalId
    )
    .eq(
      'viewer_id',
      (
        await supabase.auth.getUser()
      ).data.user?.id ?? ''
    )
    .maybeSingle();

  if (error) throw error;

  return data;
}


export async function revokeShare(
  journalAccessId
) {
  const { error } = await supabase
    .from('journal_access')
    .delete()
    .eq('id', journalAccessId);

  if (error) throw error;
}


/* =========================================================
   CREATE / GET EDITOR SHARE TOKEN
========================================================= */

export async function getOrCreateEditorShareToken(
  journalId
) {
  const {
    data: journal,
    error: fetchError,
  } = await supabase
    .from('journals')
    .select(
      'id, editor_share_token'
    )
    .eq(
      'id',
      journalId
    )
    .single();

  if (fetchError) throw fetchError;

  if (journal.editor_share_token) {
    return journal.editor_share_token;
  }

  const token =
    crypto.randomUUID();

  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .update({
      editor_share_token:
        token,
    })
    .eq(
      'id',
      journalId
    )
    .select(
      'editor_share_token'
    )
    .single();

  if (error) throw error;

  return data.editor_share_token;
}


export async function acceptEditorShareToken(
  editorToken
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'accept_editor_share_token',
    {
      p_editor_token:
        editorToken,
    }
  );

  if (error) throw error;

  return data;
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
    .select(
      'id, public_share_token'
    )
    .eq(
      'id',
      journalId
    )
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
      public_share_token:
        crypto.randomUUID(),
    })
    .eq(
      'id',
      journalId
    )
    .select(
      'public_share_token'
    )
    .single();

  if (error) {
    throw error;
  }

  return data.public_share_token;
}


/* =========================================================
   GET PUBLIC VIEW COUNT
========================================================= */

export async function getPublicShareViewCount(
  journalId
) {
  const {
    data,
    error,
  } = await supabase
    .from('journals')
    .select(
      'public_share_views'
    )
    .eq(
      'id',
      journalId
    )
    .single();

  if (error) {
    throw error;
  }

  return Number(
    data?.public_share_views ?? 0
  );
}


/* =========================================================
   RECORD A PUBLIC SHARE VIEW
========================================================= */

export async function recordPublicShareView(
  shareToken
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'record_public_share_view',
    {
      p_share_token:
        shareToken,
    }
  );

  if (error) {
    throw error;
  }

  return Number(
    data ?? 0
  );
}