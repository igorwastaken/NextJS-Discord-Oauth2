import fetch from "node-fetch";
import { serialize } from "cookie";
import { config } from "@/utils/config";
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export const runtime = "edge";

const scope = ["identify"].join(" ");
const REDIRECT_URI = `${config.appUri}/api/auth/discord`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.clientId,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export default async (req) => {
  if (req.method !== "GET") return NextResponse.redirect("/");

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/?error=${error}`);
  }
  if (!code || typeof code !== "string") return NextResponse.redirect(OAUTH_URI);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
    scope,
  }).toString();

  const response = await fetch("https://discord.com/api/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    return NextResponse.redirect(OAUTH_URI);
  }

  const { access_token = null, token_type = "Bearer" } = await response.json();
  if (!access_token || typeof access_token !== "string") {
    return NextResponse.redirect(OAUTH_URI);
  }

  const meResponse = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `${token_type} ${access_token}` },
  });

  if (!meResponse.ok) {
    console.error("Error fetching user info:", await meResponse.text());
    return NextResponse.redirect(OAUTH_URI);
  }

  const me = await meResponse.json();
  if (!("id" in me)) {
    return NextResponse.redirect(OAUTH_URI);
  }

  const token = await new SignJWT(me)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(config.jwtSecret));

  const cookie = serialize(config.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
  });
  console.log(cookie)
  const responseHeaders = new Headers();
  responseHeaders.append(config.cookieName, token);

  const res = NextResponse.redirect(config.appUri);
  responseHeaders.forEach((value, key) => {
    console.log(value, key);
    res.cookies.set(key, value);
  });

  return res;
};
