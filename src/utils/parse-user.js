import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { config } from "./config";

export function parseUser(ctx) {
  if (!ctx.req.headers.cookie) {
    return null;
  }

  const token = parse(ctx.req.headers.cookie)[config.cookieName];

  if (!token) {
    return null;
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret);
    return user;
  } catch (e) {
    return null;
  }
}
