import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gatenlabs.com ' },
      update: {},
      create: {
        email: 'admin@gatenlabs.com ',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    // Create student user
    const student = await prisma.user.upsert({
      where: { email: 'student@gaten.com' },
      update: {},
      create: {
        email: 'student@gaten.com',
        name: 'Student User',
        password: hashedPassword,
        role: 'STUDENT',
        emailVerified: true,
      },
    });

    console.log('✅ Test users created:');
    console.log('📧 Admin: admin@gaten.com | Password: password123');
    console.log('📧 Student: student@gaten.com | Password: password123');
    console.log('');
    console.log('Users created:', { admin: admin.email, student: student.email });

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();