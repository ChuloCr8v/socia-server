import { PrismaClient } from '../generated/prisma'
import { hash } from 'argon2'

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data: {
            email: "cleverdeveloper360@gmail.com",
            name: "Nkematu Bonaventure",
            auth: {
                create: {
                    passHash: await hash("Password123?")
                }
            }
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
