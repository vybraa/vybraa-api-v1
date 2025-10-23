import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = 'service_fee';
  const currency = 'NGN';

  // Check if record already exists (by name + currency)
  const existing = await prisma.vybraBillingFees.findFirst({
    where: { name, currency },
  });

  if (existing) {
    console.log(
      `VybraBillingFees already exists for ${name} (${currency}). Skipping.`,
    );
    return;
  }

  await prisma.vybraBillingFees.create({
    data: {
      name,
      price: 5000.0,
      currency,
      isActive: true,
    },
  });

  console.log('Seeded VybraBillingFees: service_fee (NGN 5000)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
