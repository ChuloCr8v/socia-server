import {
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';

type Err = 400 | 401 | 403 | 404 | 500;

export function bad(message: string, err: Err = 400): never {
    switch (err) {
        case 400:
            throw new BadRequestException(message);
        case 401:
            throw new UnauthorizedException(message);
        case 403:
            throw new ForbiddenException(message);
        case 404:
            throw new NotFoundException(message);
        case 500:
            throw new InternalServerErrorException(message);
        default:
            throw new BadRequestException(message); // fallback
    }
}
