import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please log in to view your personalized feed",
        },
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "9", 10)));

    const userFavourites = await prisma.favouriteCategory.findMany({
      where: { userId: user.userId },
      select: { category: true },
    });

    const categoryList = userFavourites.map((f) => f.category);

    if (categoryList.length === 0) {
      return NextResponse.json({
        data: {
          hasFavourites: false,
          categories: [],
          items: [],
          page: 1,
          pageSize,
          total: 0,
          totalPages: 1,
        },
      });
    }

    const now = new Date();
    const where = {
      isActive: true,
      startsAt: { gte: now },
      category: { in: categoryList },
    };

    const skip = (page - 1) * pageSize;
    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startsAt: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.userId,
        eventId: { in: items.map((i) => i.id) },
      },
      select: { eventId: true },
    });

    const remindedSet = new Set(reminders.map((r) => r.eventId));
    const enriched = items.map((e) => ({
      ...e,
      isReminded: remindedSet.has(e.id),
    }));

    return NextResponse.json({
      data: {
        hasFavourites: true,
        categories: categoryList,
        items: enriched,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load feed",
        },
      },
      { status: 500 }
    );
  }
}
