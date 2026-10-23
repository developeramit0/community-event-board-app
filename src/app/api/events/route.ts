import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { eventsQuerySchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedQuery = eventsQuerySchema.safeParse({
      category: searchParams.get("category") || undefined,
      city: searchParams.get("city") || undefined,
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsedQuery.error.errors[0]?.message || "Invalid query parameters",
          },
        },
        { status: 400 }
      );
    }

    const { category, city, q, page, pageSize } = parsedQuery.data;
    const now = new Date();

    const whereConditions: Prisma.EventWhereInput[] = [
      { isActive: true },
      { startsAt: { gte: now } },
    ];

    if (category) {
      whereConditions.push({ category });
    }

    if (city) {
      whereConditions.push({ city: { equals: city } });
    }

    if (q) {
      whereConditions.push({
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      });
    }

    const where: Prisma.EventWhereInput = {
      AND: whereConditions,
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startsAt: "asc" },
        skip,
        take,
      }),
    ]);

    const currentUser = getUserFromRequest(req);
    let remindedEventIds = new Set<string>();

    if (currentUser) {
      const userReminders = await prisma.reminder.findMany({
        where: {
          userId: currentUser.userId,
          eventId: { in: items.map((i) => i.id) },
        },
        select: { eventId: true },
      });
      remindedEventIds = new Set(userReminders.map((r) => r.eventId));
    }

    const enrichedItems = items.map((event) => ({
      ...event,
      isReminded: remindedEventIds.has(event.id),
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data: {
        items: enrichedItems,
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch events",
        },
      },
      { status: 500 }
    );
  }
}
