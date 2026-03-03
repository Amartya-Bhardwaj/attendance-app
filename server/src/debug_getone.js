import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const id = '69a690a19b873e13ad189bcd';
    try {
        const student = await prisma.student.findUnique({
            where: { id: id },
        });
        console.log('Successfully fetched student:', student);
    } catch (error) {
        console.error('ERROR fetching student:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
