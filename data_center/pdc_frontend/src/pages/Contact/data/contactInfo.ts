export interface ContactChannel {
    id: string
    type: 'phone' | 'whatsapp' | 'email'
    icon: 'Phone' | 'MessageCircle' | 'Mail'
    title: string
    value: string
    description: string
    href: string
    color: string
}

export interface SocialChannel {
    id: string
    name: string
    handle: string
    url: string
    icon: string
    color: string
}

export const CONTACT_CHANNELS: ContactChannel[] = [
    {
        id: 'phone',
        type: 'phone',
        icon: 'Phone',
        title: 'الدعم الفني',
        value: '920029007',
        description: 'اتصل بنا للاستفسارات والدعم على مدار الساعة',
        href: 'tel:920029007',
        color: '#C8A84B',
    },
    {
        id: 'whatsapp',
        type: 'whatsapp',
        icon: 'MessageCircle',
        title: 'واتساب',
        value: '920013509',
        description: 'تواصل سريع ومباشر عبر الواتساب',
        href: 'https://wa.me/966920013509',
        color: '#25D366',
    },
    {
        id: 'email',
        type: 'email',
        icon: 'Mail',
        title: 'البريد الإلكتروني',
        value: 'csteam@baytelebaa.com',
        description: 'للاستفسارات الرسمية وخدمة العملاء',
        href: 'mailto:csteam@baytelebaa.com',
        color: '#6B9FBA',
    },
]

export const SOCIAL_CHANNELS: SocialChannel[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        handle: '@baytalebaa',
        url: 'https://www.instagram.com/baytalebaa/',
        icon: 'Instagram',
        color: '#E4405F',
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        handle: '@baytalebaa',
        url: 'https://x.com/baytalebaa',
        icon: 'Twitter',
        color: '#888888',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        handle: 'baytalebaa',
        url: 'https://www.facebook.com/baytalebaa',
        icon: 'Facebook',
        color: '#1877F2',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        handle: '@baytalebaa',
        url: 'https://www.tiktok.com/@baytalebaa',
        icon: 'TikTok',
        color: '#888888',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        handle: '@BaytAlebaa',
        url: 'https://www.youtube.com/@BaytAlebaa/videos',
        icon: 'Youtube',
        color: '#FF0000',
    },
    {
        id: 'snapchat',
        name: 'Snapchat',
        handle: 'baytalebaa',
        url: 'https://t.snapchat.com/aUIItaYS',
        icon: 'Snapchat',
        color: '#FFCB00',
    },
]
