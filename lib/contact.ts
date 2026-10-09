/**
 * Where reports and appeals go. Keep equal to the backend's ABUSE_CONTACT_EMAIL (suspension
 * emails use that). Configurable because some mail hosts reserve `abuse@`.
 */
export const ABUSE_CONTACT_EMAIL = process.env.NEXT_PUBLIC_ABUSE_CONTACT_EMAIL?.trim() || 'abuse@pushify.dev';
