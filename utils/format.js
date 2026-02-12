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
