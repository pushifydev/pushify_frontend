/** Managed cloud provisioning — backend only supports Hetzner today. */
export const MANAGED_CLOUD_PROVIDER = 'hetzner' as const;

export const COMING_SOON_CLOUD_PROVIDERS = ['digitalocean', 'aws', 'gcp'] as const;

export type ComingSoonCloudProvider = (typeof COMING_SOON_CLOUD_PROVIDERS)[number];
