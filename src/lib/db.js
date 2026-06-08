import { supabase } from './supabase'

function stickyFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    mode: row.mode,
    content: row.content,
    color: row.color,
    rotation: row.rotation,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    tagIds: row.tag_ids ?? [],
    sortOrder: row.sort_order ?? row.created_at ?? 0,
  }
}

function stickyToRow(sticky) {
  return {
    id: sticky.id,
    title: sticky.title,
    mode: sticky.mode,
    content: sticky.content,
    color: sticky.color,
    rotation: sticky.rotation,
    created_at: sticky.createdAt,
    completed_at: sticky.completedAt,
    tag_ids: sticky.tagIds ?? [],
    sort_order: sticky.sortOrder ?? sticky.createdAt ?? 0,
  }
}

function tagFromRow(row) {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at }
}

export async function fetchStickies() {
  const { data, error } = await supabase
    .from('stickies')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data.map(stickyFromRow)
}

export async function fetchTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(tagFromRow)
}

export async function insertSticky(sticky) {
  const { error } = await supabase.from('stickies').insert(stickyToRow(sticky))
  if (error) console.error('insertSticky:', error)
}

export async function updateSticky(sticky) {
  const { title, mode, content, color, rotation, completed_at, tag_ids, sort_order } = stickyToRow(sticky)
  const { error } = await supabase
    .from('stickies')
    .update({ title, mode, content, color, rotation, completed_at, tag_ids, sort_order })
    .eq('id', sticky.id)
  if (error) console.error('updateSticky:', error)
}

export async function deleteSticky(id) {
  const { error } = await supabase.from('stickies').delete().eq('id', id)
  if (error) console.error('deleteSticky:', error)
}

export async function insertTag(tag) {
  const { error } = await supabase.from('tags').insert({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    created_at: tag.createdAt,
  })
  if (error) console.error('insertTag:', error)
}

export async function deleteTag(tagId) {
  const { error } = await supabase.from('tags').delete().eq('id', tagId)
  if (error) console.error('deleteTag:', error)
}

export async function clearTagFromStickies(tagId) {
  const { data, error } = await supabase
    .from('stickies')
    .select('id, tag_ids')
    .contains('tag_ids', [tagId])
  if (error || !data?.length) return
  await Promise.all(
    data.map(row =>
      supabase
        .from('stickies')
        .update({ tag_ids: row.tag_ids.filter(id => id !== tagId) })
        .eq('id', row.id)
    )
  )
}
