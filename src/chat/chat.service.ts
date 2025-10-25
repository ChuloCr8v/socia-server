import { Injectable } from '@nestjs/common';
import { bad } from 'src/utils/error.utils';
import { Chatdto, ContentResponse } from './chat.dto';
import { promptTemplate } from 'src/utils/prompt-template.util';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
    private groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    async generateContent(dto: Chatdto) {
        const { niche, keyword, platform, tone, includeHashtags, mode } = dto;

        try {
            const prompt = promptTemplate({
                niche,
                keyword,
                platform,
                tone,
                includeHashtags,
                mode
            });

            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: 'system',
                        content: 'You are a creative strategist that always returns valid JSON only.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 1,
                max_tokens: 2000,
            });

            const raw = completion.choices[0]?.message?.content?.trim() || '[]';

            try {
                const parsed: ContentResponse[] = JSON.parse(raw);
                console.log('✅ Parsed structured JSON:', parsed);
                return parsed;
            } catch {
                console.warn('⚠️ Model returned invalid JSON, attempting cleanup…');

                const jsonMatch = raw.match(/\[.*\]/s);
                if (jsonMatch) {
                    try {
                        const cleaned = JSON.parse(jsonMatch[0]);
                        console.log('✅ Recovered structured JSON:', cleaned);
                        return cleaned;
                    } catch {
                        console.error('❌ Still invalid JSON, returning empty array.');
                        return [];
                    }
                }
                return [];
            }
        } catch (error) {
            console.error('❌ Chat generation failed:', error);
            throw bad(error?.response?.data || error.message);
        }
    }
}
