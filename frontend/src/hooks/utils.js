export function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function totalUnits(courseIds, COURSES) {
  return courseIds.reduce((acc, id) => {
    const c = COURSES.find(x => x.id === id)
    return acc + (c?.units || 0)
  }, 0)
}
