import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      {
        ok: true,
        service: "odiadesk",
        database: "ready",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return Response.json(
      {
        ok: false,
        service: "odiadesk",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
