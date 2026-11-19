
'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;

  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be a valid 64-character hexadecimal key.'
    );
  }

  return Buffer.from(key, 'hex');
};

const encrypt = (text) => {
  if (typeof text !== 'string' || !text) {
    throw new Error('A non-empty string is required for encryption.');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex')
  ].join(':');
};

const decrypt = (encryptedValue) => {
  if (typeof encryptedValue !== 'string') {
    throw new Error('Invalid encrypted value.');
  }

  const parts = encryptedValue.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  if (
    !/^[a-fA-F0-9]{24}$/.test(ivHex) ||
    !/^[a-fA-F0-9]{32}$/.test(authTagHex) ||
    !/^(?:[a-fA-F0-9]{2})+$/.test(encryptedHex)
  ) {
    throw new Error('Invalid encrypted token data.');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
};

module.exports = { encrypt, decrypt };
