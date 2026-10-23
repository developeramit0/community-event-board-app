import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reminders: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Event not found",
          },
        },
        { status: 404 }
      );
    }

    const currentUser = getUserFromRequest(req);
    let isReminded = false;
    let cardDesign = null;

    if (currentUser) {
      const [reminder, design] = await Promise.all([
        prisma.reminder.findUnique({
          where: {
            userId_eventId: {
              userId: currentUser.userId,
              eventId: id,
            },
          },
        }),
        prisma.eventCardDesign.findUnique({
          where: {
            userId_eventId: {
              userId: currentUser.userId,
              eventId: id,
            },
          },
        }),
      ]);

      isReminded = Boolean(reminder);
      if (design) {
        cardDesign = {
          theme: design.theme,
          stickers: JSON.parse(design.stickers || "[]"),
          updatedAt: design.updatedAt,
        };
      }
    }

    return NextResponse.json({
      data: {
        ...event,
        isReminded,
        cardDesign,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch event details",
        },
      },
      { status: 500 }
    );
  }
}
