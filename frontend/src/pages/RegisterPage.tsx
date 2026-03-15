import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await register({
        fullName: String(formData.get("fullName")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Registration failed. The email may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Internal Test UI</p>
          <h1>Create account</h1>
          <p className="muted-text">
            This creates a backend user, wallet, and starter auth session.
          </p>
        </div>

        <Field label="Full name">
          <input name="fullName" placeholder="Dr. Alex Researcher" required type="text" />
        </Field>

        <Field label="Email">
          <input name="email" placeholder="alex@example.com" required type="email" />
        </Field>

        <Field label="Password">
          <input name="password" placeholder="Minimum 8 characters" required type="password" />
        </Field>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="muted-text">
          Already have access? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};
