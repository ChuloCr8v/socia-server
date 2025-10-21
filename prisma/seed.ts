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
        description: 'Balls of Delight like Eba, Fufu, Amala, and Pounded Yam',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Swallow',
            publicId: 'img-id-1',
        },
    },
    {
        name: 'Rice Dishes',
        description: 'Jollof, Fried Rice, Ofada and more',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Rice',
            publicId: 'img-id-2',
        },
    },
    {
        name: 'Soups & Stews',
        description: 'Egusi, Ogbono, Afang, Nsala, and other rich flavors',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Soups',
            publicId: 'img-id-3',
        },
    },
    {
        name: 'Grills & Barbecue',
        description: 'Suya, Chicken, Beef, and Fish straight from the fire',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Grills',
            publicId: 'img-id-4',
        },
    },
    {
        name: 'Snacks',
        description: 'Puff-Puff, Buns, Meat Pie, and Chin Chin',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Snacks',
            publicId: 'img-id-5',
        },
    },
    {
        name: 'Seafood',
        description: 'Peppered Fish, Catfish Pepper Soup, and Prawns',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Seafood',
            publicId: 'img-id-6',
        },
    },
    {
        name: 'Vegetarian',
        description: 'Plantain, Beans, Moi Moi, and Veggie Stir-Fries',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Vegetarian',
            publicId: 'img-id-7',
        },
    },
    {
        name: 'Drinks',
        description: 'Zobo, Palm Wine, Chapman, Smoothies, and Soft Drinks',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Drinks',
            publicId: 'img-id-8',
        },
    },
    {
        name: 'Desserts',
        description: 'Cakes, Pastries, and Nigerian sweets',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Desserts',
            publicId: 'img-id-9',
        },
    },
    {
        name: 'Ice Cream & Frozen Treats',
        description: 'Ice Cream, Frozen Yogurt, and Shakes',
        image: {
            url: 'https://via.placeholder.com/300x200.png?text=Ice+Cream',
            publicId: 'img-id-10',
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
                    userName: user.name,
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
