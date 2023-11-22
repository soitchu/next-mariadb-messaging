import * as Bcrypt from "bcrypt";
import uid from "uid-safe";
import { v4 as uuidv4 } from "uuid";
import * as Cookie from "cookie-signature";
import "dotenv/config";
import { getUserIdByToken } from "../api";

const cookieSecret = process.env.COOKIE_SECRET;

export async function hashPassword(password: string) {
  return await Bcrypt.hash(password, 10);
}

export async function comparePassword(hashedPassword: string, password: string) {
  return await Bcrypt.compare(password, hashedPassword);
}

// https://owasp.org/www-community/vulnerabilities/Insufficient_Session-ID_Length
export async function genSessionToken() {
  // uid(72) returns a string of 96 length since
  // the random strings gets encoded to base64
  // So, 96 + 32 + 128
  const token = (await uid(72)) + uuidv4().replaceAll("-", "");
  const signedCookie = Cookie.sign(token, cookieSecret);
  return [token, signedCookie];
}

export async function getUserIdByCookie(cookieString: string) {
  const token = Cookie.unsign(cookieString, cookieSecret);
  if (!token) {
    throw new Error("Invalid token.");
  }

  return await getUserIdByToken(token);
}
