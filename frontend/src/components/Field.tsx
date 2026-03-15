import type { PropsWithChildren } from "react";

interface FieldProps extends PropsWithChildren {
  label: string;
}

export const Field = ({ label, children }: FieldProps) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
