export class Chatdto {

    niche: string[] | []
    keyword: string
    mode: 'single' | 'calendar'
    platform: "X" | "LINKEDIN" | "TIKTOK"
    tone?: string
    includeHashtags?: boolean
    threadLength?: number

}


export class ContentResponse {
    day: number;
    main: string;
    replies?: string[];
    notes?: string;
}