import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
    private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    constructor(private readonly httpService: HttpService) { }

    async initializeTransaction(email: string, amount: number) {
        const url = 'https://api.paystack.co/transaction/initialize';

        const response = await firstValueFrom(
            this.httpService.post(
                url,
                {
                    email,
                    amount,
                    callback_url: `${process.env.BASE_URL}/paystack/callback`,
                    cancel_url: `${process.env.BASE_URL}/paystack/cancel`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecret}`,
                        'Content-Type': 'application/json',
                    },
                },
            ),
        );

        return response.data;
    }


    async verifyTransaction(reference: string) {
        const url = `https://api.paystack.co/transaction/verify/${reference}`;

        const response = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecret}`,
                },
            }),
        );

        return response.data;
    }
}
