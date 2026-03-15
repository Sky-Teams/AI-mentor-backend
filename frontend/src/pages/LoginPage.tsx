import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });

      const next = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(next, { replace: true });
    } catch (submitError) {
      setError("Login failed. Check the seeded user or your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Internal Test UI</p>
          <h1>Sign in</h1>
          <p className="muted-text">
            Use the seeded admin or test user to exercise backend flows.
          </p>
        </div>

        <Field label="Email">
          <input name="email" placeholder="researcher@example.com" required type="email" />
        </Field>

        <Field label="Password">
          <input name="password" placeholder="Enter password" required type="password" />
        </Field>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="muted-text">
          Need a fresh account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};
