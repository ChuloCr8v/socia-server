// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-token';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-token') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
        const email = profile?.emails?.[0]?.value;
        const user = {
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            googleId: profile.id,
        };

        done(null, user);
    }
}
