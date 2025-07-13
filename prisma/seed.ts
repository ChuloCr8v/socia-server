// import { PrismaClient, Role } from '@prisma/client';
// import { hash } from 'argon2'

// const prisma = new PrismaClient()
// const data = [
//     {
//         email: "chrisejike16gmail.com",
//         name: "Ejiekme Agunwa"
//     },
//     {
//         email: "johnpaulnduka400gmail.com",
//         name: "Johnpaul Nduka"
//     },
// ]

// async function main() {
//     await prisma.user.create({
//         data: {
//             email: "cleverdeveloper360@gmail.com",
//             name: "Nkematu Bonaventure",
//             role: Role.ADMIN,
//             isVerified: true,
//             auth: {
//                 create: {
//                     passHash: await hash("Password123?")
//                 }
//             }
//         }
//     })
// }

// main()
//     .then(async () => {
//         await prisma.$disconnect();
//     })
//     .catch(async (e) => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });
