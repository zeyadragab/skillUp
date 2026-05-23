import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Coins,
  Flag,
  Star,
  Bell,
  Settings,
  LogOut,
  Zap,
  BarChart2,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { openCommandPalette } from "../common/CommandPalette";

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  permission: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        path: "/dashboard",
        label: "Operations",
        icon: LayoutDashboard,
        permission: "analytics",
      },
      {
        path: "/analytics",
        label: "Analytics",
        icon: BarChart2,
        permission: "analytics",
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      { path: "/users", label: "Users", icon: Users, permission: "users" },
      {
        path: "/teachers",
        label: "Teachers",
        icon: GraduationCap,
        permission: "teachers",
      },
      {
        path: "/skills",
        label: "Skills",
        icon: BookOpen,
        permission: "skills",
      },
      {
        path: "/reports",
        label: "Reports",
        icon: Flag,
        permission: "reports",
        badge: 2,
      },
      { path: "/reviews", label: "Reviews", icon: Star, permission: "reviews" },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        path: "/sessions",
        label: "Sessions",
        icon: CalendarDays,
        permission: "sessions",
      },
      {
        path: "/transactions",
        label: "Transactions",
        icon: Coins,
        permission: "transactions",
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        path: "/notifications",
        label: "Notifications",
        icon: Bell,
        permission: "notifications",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        path: "/settings",
        label: "Settings",
        icon: Settings,
        permission: "settings",
      },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  /* Existing permission logic preserved exactly */
  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return admin.permissions[permission as keyof typeof admin.permissions];
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-rail flex flex-col z-50">
      {/* Wordmark */}
      <div className="flex items-center h-14 gap-3 px-5 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-[oklch(15%_0.008_55)]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-fg-inv leading-none tracking-tight">
            skillup
          </p>
          <p className="text-[10px] text-fg-rail uppercase tracking-widest mt-0.5">
            Admin
          </p>
        </div>
      </div>

      {/* Command palette trigger */}
      <div className="px-3 py-2 border-b border-white/5">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2.5 h-8 px-3 bg-white/4 hover:bg-white/[0.07] border border-white/[0.07] rounded-lg text-[12px] text-fg-rail hover:text-fg-inv transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[9px] font-mono bg-white/5 border border-white/10 rounded px-1 py-px shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav groups */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-3"
        aria-label="Main navigation"
      >
        {navGroups.map((group) => {
          const visible = group.items.filter((item) =>
            hasPermission(item.permission),
          );
          if (visible.length === 0) return null;

          return (
            <div key={group.label} className="mb-6">
              <p className="px-3 mb-2 text-[10px] font-semibold text-fg-rail/50 uppercase tracking-widest select-none">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/dashboard" &&
                      location.pathname.startsWith(item.path));
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                        transition-colors duration-150 outline-none
                        focus-visible:ring-2 focus-visible:ring-accent/60
                        ${
                          isActive
                            ? "bg-rail-lo text-fg-inv"
                            : "text-fg-rail hover:bg-rail-hi hover:text-fg-inv"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-accent"
                            : "opacity-50 group-hover:opacity-80"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-err-bg text-err">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Admin footer */}
      <div className="px-3 pb-3 border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-[oklch(15%_0.008_55)] flex-shrink-0">
            {admin?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-fg-inv truncate leading-none">
              {admin?.name ?? "Admin"}
            </p>
            <p className="text-[10px] text-fg-rail capitalize truncate mt-0.5">
              {admin?.role?.replace("_", " ") ?? "admin"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-fg-rail hover:text-err hover:bg-rail-hi transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
