export type ShellItem = { label: string; href: string; icon?: string }
export type ShellSection = { title?: string; items: ShellItem[] }

export const shellConfig: { brand: string; nav: ShellSection[] } = {
  brand: "MRR Platform Builder — Admin",
  nav: [
    {
      title: "Overview",
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" }],
    },
    {
      title: "Management",
      items: [
        { label: "Settings", href: "/admin/settings", icon: "settings" },
        { label: "Members", href: "/admin/members", icon: "members" },
        { label: "Plans", href: "/admin/plans", icon: "plans" },
        { label: "Tools", href: "/admin/tools", icon: "tools" },
      ],
    },
    {
      title: "Community",
      items: [
        { label: "Comments", href: "/admin/comments", icon: "comments" },
        { label: "Groups", href: "/admin/groups", icon: "groups" },
        { label: "Events", href: "/admin/events", icon: "events" },
      ],
    },
    {
      title: "Site Content",
      items: [
        { label: "Categories/Tags", href: "/admin/categories", icon: "categories" },
        { label: "Content", href: "/admin/content", icon: "education" },
        { label: "Experts", href: "/admin/experts", icon: "experts" },
        { label: "Products", href: "/admin/products", icon: "products" },
        { label: "Services", href: "/admin/services", icon: "services" },
        { label: "Course", href: "/admin/course", icon: "course" },
      ],
    },
    {
      title: "Operations",
      items: [{ label: "Support", href: "/admin/support", icon: "support" }],
    },
  ],
}
