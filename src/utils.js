export function datesOverlap(startA, endA, startB, endB) {
  return startA <= endB && endA >= startB;
}

export function getBookedQty(itemId, start, end, bookings, excludeId = null) {
  return bookings
    .filter(booking => booking.id !== excludeId && datesOverlap(start, end, booking.startDate, booking.endDate))
    .reduce((total, booking) => {
      const entry = booking.kit.find(k => k.itemId === itemId);
      return total + (entry ? entry.qty : 0);
    }, 0);
}

// Returns a map of { itemId -> bookedQty } for all inventory items over a date range.
export function buildBookedMap(inventory, start, end, bookings, excludeId = null) {
  if (!start || !end) return {};
  return Object.fromEntries(
    inventory.map(item => [item.id, getBookedQty(item.id, start, end, bookings, excludeId)])
  );
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
