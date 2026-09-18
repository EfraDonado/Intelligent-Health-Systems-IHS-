import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import Badge from "./Badge";
import ChatbotWidget from "./ChatbotWidget";
import { cx } from "../utils/classNames";
import { DEMO_EMAIL, getCurrentUser, logout } from "../services/authService";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/history", label: "Historial", icon: HistoryIcon },
  { to: "/alerts", label: "Alertas", icon: AlertIcon },
  { to: "/thresholds", label: "Umbrales", icon: ThresholdIcon },
  { to: "/reports", label: "Reportes", icon: ReportsIcon },
  { to: "/manual", label: "Manual", icon: ManualIcon },
  { to: "/profile", label: "Perfil", icon: ProfileIcon },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), [location.pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-midnight bg-mesh text-ink">
      <div className="relative min-h-screen bg-grid">
        <div className="pointer-events-none absolute -left-10 top-10 h-48 w-48 rounded-full bg-accent/15 blur-3xl float-soft" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent2/12 blur-3xl float-soft" />

        <div className="relative z-10 flex min-h-screen">
          <aside
            className={cx(
              "hidden md:flex flex-col border-r border-ink/10 bg-panel/90 px-4 py-6 transition-all",
              collapsed ? "w-20" : "w-60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-lg font-bold text-accent">
                  I
                </div>
                {!collapsed && (
                  <div>
                    <p className="text-lg font-semibold">IHS</p>
                    <p className="text-xs text-muted">
                      Intelligent Health Systems
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className="rounded-lg border border-ink/10 p-2 text-xs text-ink/70 hover:bg-ink/5"
              >
                {collapsed ? ">>" : "<<"}
              </button>
            </div>

            <nav className="mt-6 grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-ink/5 text-ink"
                        : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                    )
                  }
                >
                  <item.icon />
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              {!collapsed && currentUser?.email === DEMO_EMAIL && (
                <div className="mb-3">
                  <Badge variant="neutral">Modo demo activo</Badge>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Salir
              </Button>
            </div>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="flex flex-col gap-3 border-b border-ink/10 bg-panel/95 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <p className="text-xs uppercase text-muted">IHS</p>
                <p className="text-[11px] text-muted sm:text-xs">
                  Intelligent Health Systems
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-sm text-ink/80">
                  {currentUser?.name || "Invitado"}
                </span>
                {currentUser?.email === DEMO_EMAIL && (
                  <Badge variant="info">Demo</Badge>
                )}
                <Button
                  variant="subtle"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleLogout}
                >
                  Cerrar sesion
                </Button>
              </div>
            </header>

            <main className="flex-1 px-4 py-6 md:px-8 fade-in">
              <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-ink/10 bg-panel/98 px-4 py-2.5 md:hidden">
              <div className="grid grid-cols-4 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cx(
                        "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px]",
                        isActive ? "bg-ink/5 text-ink" : "text-ink/60"
                      )
                    }
                  >
                    <item.icon small />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </div>
        <ChatbotWidget />
      </div>
    </div>
  );
}

function IconWrapper({ children, small }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center",
        small ? "h-4 w-4" : "h-5 w-5"
      )}
    >
      {children}
    </span>
  );
}

function DashboardIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v4h-7z" />
        <path d="M13 10h7v10h-7z" />
        <path d="M4 13h7v7H4z" />
      </svg>
    </IconWrapper>
  );
}

function HistoryIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h7" />
      </svg>
    </IconWrapper>
  );
}

function AlertIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M5 20h14L12 4 5 20z" />
      </svg>
    </IconWrapper>
  );
}

function ThresholdIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 7h16" />
        <path d="M7 7v10" />
        <path d="M17 7v10" />
        <path d="M4 17h16" />
      </svg>
    </IconWrapper>
  );
}

function ReportsIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 4h8l4 4v12H6z" />
        <path d="M14 4v4h4" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    </IconWrapper>
  );
}

function ManualIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M5 5h9a3 3 0 0 1 3 3v11H8a3 3 0 0 0-3 3z" />
        <path d="M5 5v14" />
        <path d="M8 9h7" />
        <path d="M8 13h7" />
      </svg>
    </IconWrapper>
  );
}

function ProfileIcon({ small }) {
  return (
    <IconWrapper small={small}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    </IconWrapper>
  );
}
