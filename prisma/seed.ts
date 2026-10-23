import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Clean existing records (in reverse relation order)
  await prisma.eventCardDesign.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.favouriteCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const demoPassword = "DemoUser123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const demoHash = await bcrypt.hash(demoPassword, 10);

  // 3. Seed Admin and Demo User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@communityevents.com";
  const admin = await prisma.user.create({
    data: {
      email: adminEmail.toLowerCase(),
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@communityevents.com",
      passwordHash: demoHash,
      role: "USER",
      favourites: {
        create: [{ category: "MUSIC" }, { category: "WORKSHOP" }, { category: "FOOD" }],
      },
    },
  });

  console.log(`✅ Users created: Admin (${admin.email}), Demo User (${demoUser.email})`);

  // 4. Relative Dates calculation (always valid relative to current time)
  const now = new Date();
  const getRelativeDate = (daysOffset: number, hour = 18, minute = 30) => {
    const d = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    d.setUTCHours(hour, minute, 0, 0);
    return d;
  };

  // 15 Events (Mix of 5 categories, 5 cities, 3 past, 3 inactive, free + paid with ₹1.5Lakh example)
  const eventsData = [
    // --- 3 Past Events ---
    {
      title: "Coimbatore Acoustic Indie Night",
      category: "MUSIC",
      city: "Coimbatore",
      startsAt: getRelativeDate(-10, 19, 0),
      priceInPaise: 49900, // ₹499
      description: "An intimate evening with independent indie songwriters playing unplugged melodies in the heart of RS Puram.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Chennai Traditional Filter Coffee & Breakfast Trail",
      category: "FOOD",
      city: "Chennai",
      startsAt: getRelativeDate(-5, 7, 30),
      priceInPaise: 0, // Free
      description: "Walk through Mylapore visiting century-old tiffin houses and mastering the authentic degree filter coffee.",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Bengaluru Junior Clay Pottery & Craft Camp",
      category: "KIDS",
      city: "Bengaluru",
      startsAt: getRelativeDate(-2, 10, 0),
      priceInPaise: 75000, // ₹750
      description: "Hands-on pottery wheel workshop designed for kids aged 6-14 to explore tactile clay craftsmanship.",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
      isActive: false, // Inactive + Past
    },

    // --- 2 Inactive Upcoming Events ---
    {
      title: "Indore Street Food Carnival 2026 (Draft/Postponed)",
      category: "FOOD",
      city: "Indore",
      startsAt: getRelativeDate(4, 18, 0),
      priceInPaise: 25000, // ₹250
      description: "An extensive tasting journey of Chappan Dukan and Sarafa Bazar delicacies under one roof.",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      isActive: false, // Inactive
    },
    {
      title: "Mumbai Midnight Cycling Marathon (Permit Pending)",
      category: "SPORTS",
      city: "Mumbai",
      startsAt: getRelativeDate(8, 23, 0),
      priceInPaise: 99900, // ₹999
      description: "Ride across South Bombay from Marine Drive to Bandra via heritage coastal routes under the city lights.",
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      isActive: false, // Inactive
    },

    // --- 10 Active Upcoming Events ---
    {
      title: "Western Ghats Nature Trail & Birdwatching",
      category: "SPORTS",
      city: "Coimbatore",
      startsAt: getRelativeDate(2, 6, 30),
      priceInPaise: 0, // Free
      description: "Early morning guided trek along Siruvani foothills identifying endemic Western Ghats avian species.",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Hands-on Next.js & TypeScript Architecture Masterclass",
      category: "WORKSHOP",
      city: "Bengaluru",
      startsAt: getRelativeDate(3, 14, 0),
      priceInPaise: 149900, // ₹1,499
      description: "Deep dive into production Next.js 14 App Router patterns, state isolation, server actions, and edge rendering.",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Carnatic & Jazz Fusion Ensemble",
      category: "MUSIC",
      city: "Chennai",
      startsAt: getRelativeDate(5, 18, 30),
      priceInPaise: 120000, // ₹1,200
      description: "A mesmerizing collaborative evening bringing together classical mridangam with saxophone improvisations.",
      imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Executive Tech Leadership & AI Conclave VIP Pass",
      category: "WORKSHOP",
      city: "Bengaluru",
      startsAt: getRelativeDate(7, 9, 30),
      priceInPaise: 15000000, // ₹1,50,000 (Demonstrates Indian Lakh formatting: ₹1,50,000)
      description: "Exclusive round-table summit for CTOs and Engineering Directors on scaling AI agents and systems.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Malwa Sourdough Baking & Artisan Bread Lab",
      category: "FOOD",
      city: "Indore",
      startsAt: getRelativeDate(11, 11, 0),
      priceInPaise: 199900, // ₹1,999
      description: "Learn wild fermentation, hydration dynamics, scoring techniques, and oven hearth crust building.",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Little Astronauts: Rocket Building & Stargazing",
      category: "KIDS",
      city: "Coimbatore",
      startsAt: getRelativeDate(14, 17, 0),
      priceInPaise: 35000, // ₹350
      description: "Interactive science night for young astronomers building water-pressurized rockets followed by telescope viewing.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Sunset Rooftop Vinyl Sessions",
      category: "MUSIC",
      city: "Mumbai",
      startsAt: getRelativeDate(18, 17, 30),
      priceInPaise: 80000, // ₹800
      description: "Rare 70s funk, disco, and afrobeat played strictly on analog vinyl with panoramic Arabian Sea views.",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Monsoon 10K Coastal Community Run",
      category: "SPORTS",
      city: "Chennai",
      startsAt: getRelativeDate(22, 5, 45),
      priceInPaise: 0, // Free
      description: "Community-led timed 10K running along the scenic East Coast Road. Hydration and medals included.",
      imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Watercolour & Urban Sketching by the Lake",
      category: "WORKSHOP",
      city: "Indore",
      startsAt: getRelativeDate(28, 16, 0),
      priceInPaise: 60000, // ₹600
      description: "Learn rapid architectural drawing, light capture, and transparent watercolor washes in an outdoor group setting.",
      imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      title: "Junior Robotics & LEGO Sensor Challenge",
      category: "KIDS",
      city: "Bengaluru",
      startsAt: getRelativeDate(35, 10, 30),
      priceInPaise: 125000, // ₹1,250
      description: "Build autonomous motorized obstacle-avoidance vehicles using simple block programming and sensors.",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
  ];

  for (const item of eventsData) {
    await prisma.event.create({
      data: item,
    });
  }

  // Seed sample reminder and card design for demo user on one upcoming event
  const firstUpcoming = await prisma.event.findFirst({
    where: { isActive: true, startsAt: { gte: now } },
  });

  if (firstUpcoming) {
    await prisma.reminder.create({
      data: {
        userId: demoUser.id,
        eventId: firstUpcoming.id,
      },
    });

    await prisma.eventCardDesign.create({
      data: {
        userId: demoUser.id,
        eventId: firstUpcoming.id,
        theme: "sunset",
        stickers: JSON.stringify(["🎉", "🔥"]),
      },
    });
  }

  console.log(`✅ Successfully seeded ${eventsData.length} events with sample reminder & card design.`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
