import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'argon2';
import { userInfo } from 'os';

const prisma = new PrismaClient();

// Seed Users
const users = [
    // {
    //     email: 'chrisejike16@gmail.com',
    //     name: 'Ejiekme Agunwa',
    //     role: Role.USER,
    //     phone: "09012345679",
    //     userId: "UO002"

    // },
    // {
    //     email: 'johnpaulnduka400@gmail.com',
    //     name: 'Johnpaul Nduka',
    //     phone: "012345679",
    //     role: Role.USER,
    //     userId: "UO003"

    // },
    // {
    //     email: 'cleverdeveloper360@gmail.com',
    //     name: 'Nkematu Bonaventure',
    //     phone: "08138369977",
    //     role: Role.ADMIN,
    //     userId: "UO001"
    // },

];

// Seed Categories with mock image data
const categories = [
    {
        name: 'Swallow',
        description: 'Balls of Delight',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Pizza',
            publicId: 'img-id-1',
        },
    },
    {
        name: 'Rice',
        description: 'Cheffed for all ocassions',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Burgers',
            publicId: 'img-id-2',
        },
    },
    {
        name: 'Drinks',
        description: 'Refreshing beverages and soft drinks',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Drinks',
            publicId: 'img-id-3',
        },
    },
];

async function seedUsers() {
    for (const user of users) {
        const existing = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!existing) {
            await prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                    isVerified: true,
                    auth: {
                        create: {
                            passHash: await hash(
                                user.role === Role.ADMIN ? 'Password123?' : 'User12345!'
                            ),
                        },
                    },
                    userId: user.userId
                },
            });
            console.log(`✅ Created user: ${user.email}`);
        } else {
            console.log(`ℹ️ Skipped existing user: ${user.email}`);
        }

    }
}

async function seedCategories() {
    for (const dto of categories) {
        try {
            const existing = await prisma.category.findFirst({
                where: { name: dto.name },
            });

            if (!existing) {
                await prisma.category.create({
                    data: {
                        name: dto.name,
                        description: dto.description,
                        // image: {
                        //     create: {
                        //         url: dto.image.url,
                        //         publicId: dto.image.publicId,
                        //     },
                        // },
                    },
                });
                console.log(`✅ Created category: ${dto.name}`);
            } else {
                console.log(`ℹ️ Skipped existing category: ${dto.name}`);
            }
        } catch (error) {
            console.error(`❌ Failed to create category ${dto.name}:`, error.message);
        }
    }
}

async function main() {
    console.log('🌱 Starting seeding...');
    await seedUsers();
    await seedCategories();
}

main()
    .then(async () => {
        console.log('🌱 Seeding completed');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e.message);
        console.error(e.stack);
        await prisma.$disconnect();
        process.exit(1);
    });
