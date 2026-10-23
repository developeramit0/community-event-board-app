import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateCardDesignSchema } from "@/lib/validators";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to view your card design",
        },
      },
      { status: 401 }
    );
  }

  const { id: eventId } = params;

  try {
    const design = await prisma.eventCardDesign.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId,
        },
      },
    });

    if (!design) {
      return NextResponse.json({
        data: null,
      });
    }

    return NextResponse.json({
      data: {
        theme: design.theme,
        stickers: JSON.parse(design.stickers || "[]"),
        updatedAt: design.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve card design",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to save your card design",
        },
      },
      { status: 401 }
    );
  }

  const { id: eventId } = params;

  try {
    const body = await req.json();
    const result = updateCardDesignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message || "Invalid card design parameters",
          },
        },
        { status: 400 }
      );
    }

    const { theme, stickers } = result.data;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Event does not exist",
          },
        },
        { status: 404 }
      );
    }

    const saved = await prisma.eventCardDesign.upsert({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId,
        },
      },
      create: {
        userId: user.userId,
        eventId,
        theme,
        stickers: JSON.stringify(stickers),
      },
      update: {
        theme,
        stickers: JSON.stringify(stickers),
      },
    });

    return NextResponse.json({
      data: {
        theme: saved.theme,
        stickers: JSON.parse(saved.stickers),
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to save card design",
        },
      },
      { status: 500 }
    );
  }
}
