'use client';

import { Children, type ReactNode } from 'react';

/**
 * Building blocks for the project settings form: a section card with a mono label, consistent
 * label-left / control-right field rows, and an ink switch. Styles live in app/globals.css
 * (.dash-settings-*, .dash-field*, .dash-switch).
 */
export function SettingsSection({
  id,
  title,
  description,
  action,
  footer,
  danger,
  padded,
  children,
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Right side of the header (a switch, a refresh button, an add button). */
  action?: ReactNode;
  /** Save row under the fields. */
  footer?: ReactNode;
  danger?: boolean;
  /** Free-form body (lists, notes) instead of field rows. */
  padded?: boolean;
  children?: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`dash-settings-section${danger ? ' is-danger' : ''}`}
    >
      <header className="dash-settings-head">
        <div>
          <h3 id={headingId}>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </header>
      {Children.toArray(children).length > 0 && (
        <div className={`dash-settings-body${padded ? ' is-padded' : ''}`}>{children}</div>
      )}
      {footer && <footer className="dash-settings-foot">{footer}</footer>}
    </section>
  );
}

export function SettingsField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="dash-field">
      <div className="min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="dash-field-label">
            {label}
          </label>
        ) : (
          <span className="dash-field-label">{label}</span>
        )}
        {hint && <p className="dash-field-hint">{hint}</p>}
      </div>
      <div className="dash-field-control">{children}</div>
    </div>
  );
}

export function SettingsSwitch({
  checked,
  onChange,
  disabled,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="dash-switch"
    >
      <span className="dash-switch-thumb" />
    </button>
  );
}
