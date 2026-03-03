import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany();
        console.log('Successfully fetched', students.length, 'students');
        console.log(JSON.stringify(students, null, 2));
    } catch (error) {
        console.error('ERROR fetching students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
