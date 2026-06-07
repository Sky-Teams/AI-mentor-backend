import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AppLayout = () => {
  const { user, logout } = useAuth();

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
          <NavLink to="/billing">Billing</NavLink>
          {user?.role === "ADMIN" ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <span>{user?.fullName}</span>
            <small>{user?.role}</small>
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
