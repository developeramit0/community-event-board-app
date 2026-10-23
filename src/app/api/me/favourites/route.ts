import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateFavouritesSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please log in to view favourite categories",
        },
      },
      { status: 401 }
    );
  }

  try {
    const favourites = await prisma.favouriteCategory.findMany({
      where: { userId: user.userId },
      select: { category: true },
    });

    return NextResponse.json({
      data: {
        categories: favourites.map((f) => f.category),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load favourites",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please log in to update favourite categories",
        },
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = updateFavouritesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message || "Invalid categories payload",
          },
        },
        { status: 400 }
      );
    }

    const { categories } = result.data;

    await prisma.$transaction(async (tx) => {
      await tx.favouriteCategory.deleteMany({
        where: { userId: user.userId },
      });

      await tx.favouriteCategory.createMany({
        data: categories.map((category) => ({
          userId: user.userId,
          category,
        })),
      });
    });

    return NextResponse.json({
      data: {
        categories,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to save favourite categories",
        },
      },
      { status: 500 }
    );
  }
}
