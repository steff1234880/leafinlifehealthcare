import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token for a user
 * @param {object} payload - Claims to sign (e.g. { id, email, role })
 * @param {string} expiresIn - Expiry duration
 * @returns {string} Signed JWT token
 */
export function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  const secret = process.env.JWT_SECRET || 'leafinlife_default_secret_key_change_in_production';
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - Bearer JWT token
 * @returns {object} Decoded token payload
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'leafinlife_default_secret_key_change_in_production';
  return jwt.verify(token, secret);
}

