import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password using bcrypt with salt rounds
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default 10)
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password, saltRounds = 10) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid non-empty string.');
  }
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} enteredPassword - Candidate plain text password
 * @param {string} storedHash - Stored hashed password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export async function comparePassword(enteredPassword, storedHash) {
  if (!enteredPassword || !storedHash) {
    return false;
  }
  return bcrypt.compare(enteredPassword, storedHash);
}

