/** Matches group detail member sidebar label "Group Moderator". */
export function isGroupModeratorRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "moderator"
}

export function canManageGroup(membershipRole: string | null | undefined): boolean {
  return isGroupModeratorRole(membershipRole)
}
