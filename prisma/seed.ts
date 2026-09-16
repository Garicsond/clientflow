import { seedIfEmpty, shouldSeedSampleData } from "../src/lib/seed";
import { prisma } from "../src/lib/db";

async function main() {
  if (!shouldSeedSampleData()) {
    console.log(
      "Skipping seed. Hosted/production databases stay empty unless you set ALLOW_SEED=true.",
    );
    return;
  }

  const result = await seedIfEmpty();
  console.log(
    result.seeded
      ? "Seeded sample data."
      : "Database already has data; skipped seed.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
