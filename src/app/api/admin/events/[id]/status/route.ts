import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateEventStatusSchema } from "@/lib/validators";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireAdmin(req);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { id } = params;

  try {
    const body = await req.json();
    const result = updateEventStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message || "Invalid status payload",
          },
        },
        { status: 400 }
      );
    }

    const { isActive } = result.data;

    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
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

    const updated = await prisma.event.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update event status",
        },
      },
      { status: 500 }
    );
  }
}
