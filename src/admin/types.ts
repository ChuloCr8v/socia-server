import { Role } from "@prisma/client"

export class AddUserDTO {
    name: string
    email: string
    phone: string
    role: Role
}