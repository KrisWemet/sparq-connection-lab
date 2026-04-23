import crypto from 'crypto';

const MASTER_KEY = Buffer.from(process.env.REFLECTION_ENCRYPTION_KEY ?? '', 'hex');

function deriveKey(userId: string): Buffer {
  return crypto.createHmac('sha256', MASTER_KEY).update(userId).digest();
}

export function encryptText(plaintext: string, userId: string): string {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), encrypted.toString('base64'), tag.toString('base64')].join(':');
}

export function decryptText(ciphertext: string, userId: string): string {
  const [ivB64, dataB64, tagB64] = ciphertext.split(':');
  const key = deriveKey(userId);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return (
    decipher.update(Buffer.from(dataB64, 'base64')).toString('utf8') +
    decipher.final('utf8')
  );
}

export function isEncrypted(value: string): boolean {
  return value.split(':').length === 3;
}
