export function money(value) {
  return Number(value || 0).toFixed(2)
}

export function ym(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 7)
}

export function roleText(role) {
  return {
    admin: '管理员',
    member: '普通成员',
    read: '只读成员'
  }[role] || role
}

export function shortTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const h = `${d.getHours()}`.padStart(2, '0')
  const min = `${d.getMinutes()}`.padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}
