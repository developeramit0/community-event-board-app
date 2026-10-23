import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createEventSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startsAt: "desc",
      },
      include: {
        _count: {
          select: {
            reminders: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: events,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve events",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = requireAdmin(req);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message || "Invalid event payload",
          },
        },
        { status: 400 }
      );
    }

    const { title, category, city, startsAt, priceInPaise, description, imageUrl } = result.data;

    const event = await prisma.event.create({
      data: {
        title,
        category,
        city,
        startsAt: new Date(startsAt),
        priceInPaise,
        description,
        imageUrl,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        data: event,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create event",
        },
      },
      { status: 500 }
    );
  }
}
