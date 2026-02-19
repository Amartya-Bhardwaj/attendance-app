import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      name: 'School Admin',
    },
  });

  console.log('✅ Created admin user:', admin.email);
  console.log('   Password: admin123');

  // Create some sample students (check by name to avoid duplicates)
  const studentsData = [
    { name: 'Rahul Sharma', address: '123 Main Street, Delhi', parentPhone: '+919876543210' },
    { name: 'Priya Patel', address: '456 Park Avenue, Mumbai', parentPhone: '+919876543211' },
    { name: 'Arjun Singh', address: '789 Garden Road, Bangalore', parentPhone: '+919876543212' },
  ];

  for (const student of studentsData) {
    const existing = await prisma.student.findFirst({
      where: { name: student.name },
    });

    if (!existing) {
      await prisma.student.create({
        data: student,
      });
    }
  }

  console.log('✅ Created sample students');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
