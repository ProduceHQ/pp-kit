export function datesOverlap(startA, endA, startB, endB) {
  return startA <= endB && endA >= startB;
}

// Returns a Set of unit IDs that are booked over the given date range.
export function buildBookedMap(inventory, start, end, projects, excludeId = null) {
  if (!start || !end) return new Set();
  const booked = new Set();
  for (const p of projects) {
    if (p.id === excludeId) continue;
    if (!datesOverlap(start, end, p.startDate, p.endDate)) continue;
    for (const k of p.kit) booked.add(k.itemId);
  }
  return booked;
}

/**
 * Returns the display label for a unit.
 * If there is more than one unit with the same name+category, appends "(unit_number)".
 * e.g. "Sony FX3" if unique, "GoPro Hero 11 (1)" / "GoPro Hero 11 (2)" if multiple.
 */
export function unitLabel(unit, inventory) {
  const count = inventory.filter(
    u => u.category === unit.category && u.name === unit.name
  ).length;
  return count > 1 ? `${unit.name} (${unit.unit_number})` : unit.name;
}

export function fmtDate(dateStr) {
  if (!dateStr) return 'n/a';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function projStatus(project, today) {
  if (project.endDate < today)    return { label: 'Completed', variant: 'grey'  };
  if (project.startDate <= today) return { label: 'Active',    variant: 'green' };
  return                                 { label: 'Upcoming',  variant: 'blue'  };
}
