import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET || "default-insecure-jwt-secret-replace-in-env";
const JWT_EXPIRES_IN = "7d";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function signJWT(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyJWT(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    if (decoded && decoded.userId && decoded.email && decoded.role) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): AuthTokenPayload | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = verifyJWT(token);
    if (verified) return verified;
  }

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookiesArr = cookieHeader.split(";").map((c) => c.trim());
    const authCookie = cookiesArr.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (authCookie) {
      const token = authCookie.substring(AUTH_COOKIE_NAME.length + 1);
      const verified = verifyJWT(token);
      if (verified) return verified;
    }
  }

  return null;
}

export function requireAdmin(req: Request): { user: AuthTokenPayload } | { errorResponse: NextResponse } {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to access this resource",
          },
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      errorResponse: NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Admin privileges are required for this action",
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export function getAuthCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}
