import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: Request) {
  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) {
    return NextResponse.json({
      data: null,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        favourites: {
          select: { category: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        ...user,
        favouriteCategories: user.favourites.map((f) => f.category),
      },
    });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    data: { message: "Successfully logged out" },
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
