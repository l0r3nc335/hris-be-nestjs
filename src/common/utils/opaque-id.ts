import { createHmac, randomBytes } from 'crypto';

const DEFAULT_SALT = 'hris-dev-salt';

export function generateOpaqueId(): string {
  const salt = process.env.ID_HASH_SALT ?? DEFAULT_SALT;
  return createHmac('sha256', salt)
    .update(randomBytes(32))
    .digest('base64url');
}
