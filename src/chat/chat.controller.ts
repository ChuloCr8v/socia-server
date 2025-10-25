import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Chatdto } from './chat.dto';

@Controller('chat')
export class ChatController {
    constructor(private chat: ChatService) { }

    @Auth()
    @Post()
    generateContent(@Body() dto: Chatdto) {
        return this.chat.generateContent(dto)
    }
}
