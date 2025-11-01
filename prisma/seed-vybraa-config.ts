import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Vybraa config seed...');

  const configs = [
    {
      id: 'config_001',
      name: 'Request Fee Charge',
      description: 'Platform fee charged on each request',
      slug: 'request_fee_charge',
      value: '10',
      calculationType: 'PERCENTAGE' as const,
    },
    {
      id: 'config_002',
      name: 'Minimum Request Price',
      description: 'Minimum price allowed for requests',
      slug: 'minimum_request_price',
      value: '5000',
      calculationType: 'FIXED' as const,
    },
    {
      id: 'config_003',
      name: 'Maximum Request Price',
      description: 'Maximum price allowed for requests',
      slug: 'maximum_request_price',
      value: '500000',
      calculationType: 'FIXED' as const,
    },
    {
      id: 'config_004',
      name: 'Withdrawal Fee',
      description: 'Fee charged for wallet withdrawals',
      slug: 'withdrawal_fee',
      value: '100',
      calculationType: 'FIXED' as const,
    },
  ];

  for (const config of configs) {
    const existing = await prisma.vybraaConfigSettings.findUnique({
      where: { slug: config.slug },
    });

    if (existing) {
      console.log(`Config ${config.slug} already exists. Skipping.`);
      continue;
    }

    await prisma.vybraaConfigSettings.create({
      data: config,
    });

    console.log(`Seeded config: ${config.name} (${config.slug})`);
  }

  console.log('Vybraa config seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
