import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Ensure the database is clean
  await prisma.preOrderMenuItem.deleteMany({});
  await prisma.preOrder.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.restaurant.deleteMany({});

  const adminHashedPassword = await bcrypt.hash("adminPassword", 10)

  // Insert a single restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      id: "restaurant-1", // Fixed ID since there's only one restaurant
      name: "My Restaurant",
      menu: {
        create: [
          {
            id: "menu-item-1",
            name: "Pizza Margherita",
            description: "Classic Italian pizza with fresh tomatoes and basil",
            price: 12.99,
          },
          {
            id: "menu-item-2",
            name: "Spaghetti Carbonara",
            description: "Traditional Italian pasta with creamy sauce",
            price: 10.99,
          },
        ],
      },
    },
  });

  // Insert an admin user
  const admin = await prisma.user.create({
    data: {
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
      phone: "1234567890",
      password: adminHashedPassword, // In real apps, hash the password
      role: "admin",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
