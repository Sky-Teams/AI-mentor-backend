import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { subscriptionApi } from "../services/api/subscription";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [activePlanName, setActivePlanName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const active = await subscriptionApi.getActivePlan();
        setActivePlanName(active?.subscriptionPlan?.name ?? null);
      } catch (error) {}
    })();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <Link to="/dashboard" className="brand">
            AI Mentor
          </Link>
          <p className="sidebar-copy">
            Internal testing client for case report publication workflows.
          </p>
        </div>

        <nav className="nav-list">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects/new">Create Project</NavLink>
          {user?.role === "ADMIN" ? (
            <NavLink to="/journals/new">Journal</NavLink>
          ) : null}
          <NavLink to="/billing">Billing</NavLink>
          <NavLink to="/references">Citation</NavLink>
          {user?.role === "ADMIN" ? <NavLink to="/admin">Admin</NavLink> : null}
          {user?.role === "ADMIN" ? (
            <NavLink to="/admin/subscriptions">Subscription</NavLink>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <span>{user?.fullName}</span>
            <small>{user?.role}</small>
            {activePlanName ? <small>Plan: {activePlanName}</small> : null}
          </div>
          <button className="secondary-button" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
};
