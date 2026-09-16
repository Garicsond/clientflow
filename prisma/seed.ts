import { seedIfEmpty } from "../src/lib/seed";
import { prisma } from "../src/lib/db";

seedIfEmpty()
  .then((result) => {
    console.log(result.seeded ? "Seeded sample data." : "Database already has data; skipped seed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
