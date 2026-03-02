import { supabase } from './supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapProject(row) {
  return {
    id:        row.id,
    name:      row.name,
    number:    row.number ?? '',
    startDate: row.start_date,
    endDate:   row.end_date,
    kit:       (row.project_kit ?? []).map(k => ({ itemId: k.item_id, qty: k.qty })),
  };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('category')
    .order('name');
  if (error) throw error;
  return data;
}

export async function addInventoryItem({ category, name, qty }) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({ category, name, qty })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id, updates) {
  const { error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteInventoryItem(id) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_kit(*)')
    .order('start_date');
  if (error) throw error;
  return data.map(mapProject);
}

export async function saveProject(formData, existingId = null) {
  const { kit, ...rest } = formData;
  const dbRow = {
    name:       rest.name,
    number:     rest.number ?? '',
    start_date: rest.startDate,
    end_date:   rest.endDate,
  };

  let projectId = existingId;

  if (existingId) {
    // Update the project row
    const { error } = await supabase
      .from('projects')
      .update(dbRow)
      .eq('id', existingId);
    if (error) throw error;

    // Replace kit: delete old rows, insert new ones
    const { error: delErr } = await supabase
      .from('project_kit')
      .delete()
      .eq('project_id', existingId);
    if (delErr) throw delErr;
  } else {
    // Insert new project
    const { data, error } = await supabase
      .from('projects')
      .insert(dbRow)
      .select()
      .single();
    if (error) throw error;
    projectId = data.id;
  }

  // Insert kit rows (if any)
  if (kit && kit.length > 0) {
    const { error } = await supabase
      .from('project_kit')
      .insert(kit.map(k => ({ project_id: projectId, item_id: k.itemId, qty: k.qty })));
    if (error) throw error;
  }

  return projectId;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
