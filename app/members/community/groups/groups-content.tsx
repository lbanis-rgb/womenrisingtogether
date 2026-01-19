import { getUserGroupsForListing } from "./actions"
import { getGroupCategories } from "./actions/get-group-categories"
import { canUserCreateGroups } from "./actions/can-user-create-groups"
import { getAdminJoinRequests } from "./actions/get-admin-join-requests"
import GroupsListingUI from "./groups-listing-ui"

export default async function GroupsContent() {
  const [groups, categories, canCreateGroups, adminJoinRequests] = await Promise.all([
    getUserGroupsForListing(),
    getGroupCategories(),
    canUserCreateGroups(),
    getAdminJoinRequests(),
  ])

  return (
    <GroupsListingUI
      initialGroups={groups}
      categories={categories}
      canCreateGroups={canCreateGroups}
      adminJoinRequests={adminJoinRequests}
    />
  )
}
