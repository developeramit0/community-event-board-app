import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        startsAt: {
          gte: new Date(),
        },
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    });

    const cities = events.map((e) => e.city);

    return NextResponse.json({
      data: cities,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load cities",
        },
      },
      { status: 500 }
    );
  }
}
