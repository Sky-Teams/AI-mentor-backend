import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectsApi } from "../services/api/projects";
import type { Project } from "../types/api";

export const DashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectsApi.list();
        setProjects(data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Case Report Workspace</h1>
        </div>
        <Link className="primary-button" to="/projects/new">
          New project
        </Link>
      </div>

      <div className="card">
        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="muted-text">
            No projects yet. Create one to start drafting manuscript sections.
          </p>
        ) : (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Readiness</th>
                  <th>Last Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link to={`/projects/${project.id}`}>{project.title}</Link>
                    </td>
                    <td>{project.status}</td>
                    <td>{project.readinessScore ?? "-"}</td>
                    <td>{project.lastReviewedAt ? new Date(project.lastReviewedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
