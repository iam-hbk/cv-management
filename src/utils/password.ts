import { hash, compare } from "bcryptjs";

/**
 * Hashes a password with a salt using bcrypt
 * @param password The plain text password to hash
 * @returns Promise containing the hashed password
 */
export async function saltAndHashPassword(password: string): Promise<string> {
  // Generate a salt and hash the password with 10 rounds
  //   Salt will be pulled from the environment variables
  return await hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
) {
  // Using bcrypt or whatever hashing library you're using
  return await compare(plainPassword, hashedPassword);
}
