import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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
          message: "Please sign in to set a reminder",
        },
      },
      { status: 401 }
    );
  }

  const { id: eventId } = params;

  try {
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

    await prisma.reminder.upsert({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId,
        },
      },
      create: {
        userId: user.userId,
        eventId,
      },
      update: {},
    });

    return NextResponse.json({
      data: { isReminded: true, eventId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to set reminder",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to manage reminders",
        },
      },
      { status: 401 }
    );
  }

  const { id: eventId } = params;

  try {
    await prisma.reminder.deleteMany({
      where: {
        userId: user.userId,
        eventId,
      },
    });

    return NextResponse.json({
      data: { isReminded: false, eventId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to remove reminder",
        },
      },
      { status: 500 }
    );
  }
}
