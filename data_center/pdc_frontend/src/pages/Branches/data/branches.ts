export interface Branch {
    id: string
    name: string
    city: string
    region: string
    district?: string
    address: string
    googleMapsUrl: string
}

export const SUPPORT_PHONE = '920029007'

export const BRANCHES: Branch[] = [
    // ─── المنطقة الغربية ───
    {
        id: 'jeddah-nakheel',
        name: 'فرع جدة - النخيل',
        city: 'جدة',
        region: 'المنطقة الغربية',
        district: 'النخيل',
        address: 'طريق الحرمين السريع، النخيل، جدة',
        googleMapsUrl: 'https://maps.app.goo.gl/mJRojyvBsUy5rtV28',
    },
    {
        id: 'jeddah-faisaliyah',
        name: 'فرع جدة - الفيصلية',
        city: 'جدة',
        region: 'المنطقة الغربية',
        district: 'الفيصلية',
        address: 'الفيصلية، جدة',
        googleMapsUrl: 'https://maps.app.goo.gl/qjLc91sMBg6N51ej6',
    },
    {
        id: 'makkah',
        name: 'فرع مكة المكرمة',
        city: 'مكة المكرمة',
        region: 'المنطقة الغربية',
        address: 'طريق مكة–جدة السريع، مكة المكرمة',
        googleMapsUrl: 'https://maps.app.goo.gl/9hRQJNZByNecckvY6',
    },
    {
        id: 'taif',
        name: 'فرع الطائف',
        city: 'الطائف',
        region: 'المنطقة الغربية',
        district: 'الوشحاء',
        address: 'حسان بن ثابت، الوشحاء، الطائف',
        googleMapsUrl: 'https://maps.app.goo.gl/TFjXqsAV6EmRftbQ7',
    },
    {
        id: 'madinah',
        name: 'فرع المدينة المنورة',
        city: 'المدينة المنورة',
        region: 'المنطقة الغربية',
        address: 'طريق الملك عبدالله، المدينة المنورة',
        googleMapsUrl: 'https://maps.app.goo.gl/KVeoo6cvX9baod529',
    },

    // ─── المنطقة الوسطى ───
    {
        id: 'riyadh-nuzha',
        name: 'فرع الرياض - النزهة',
        city: 'الرياض',
        region: 'المنطقة الوسطى',
        district: 'النزهة',
        address: 'طريق الإمام سعود بن عبدالعزيز بن محمد، النزهة، الرياض',
        googleMapsUrl: 'https://maps.app.goo.gl/rDgDSeZMBHnqm3428',
    },
    {
        id: 'riyadh-manakh',
        name: 'فرع الرياض - المناخ',
        city: 'الرياض',
        region: 'المنطقة الوسطى',
        district: 'المناخ',
        address: 'المناخ، الرياض',
        googleMapsUrl: 'https://maps.app.goo.gl/fUENADtuzj1LCNqo7',
    },
    {
        id: 'qassim',
        name: 'فرع القصيم - بريدة',
        city: 'بريدة',
        region: 'منطقة القصيم',
        district: 'الرحاب',
        address: 'الطريق الدائري الشمالي، حي الرحاب، بريدة',
        googleMapsUrl: 'https://maps.app.goo.gl/F8yqJzqa3JiiDZpAA',
    },
    {
        id: 'hail',
        name: 'فرع حائل',
        city: 'حائل',
        region: 'منطقة حائل',
        address: 'حائل',
        googleMapsUrl: 'https://maps.app.goo.gl/oMXUwnMsVrrGBSoT6',
    },

    // ─── المنطقة الشرقية ───
    {
        id: 'dammam-sinaiyah',
        name: 'فرع الدمام - الصناعية',
        city: 'الدمام',
        region: 'المنطقة الشرقية',
        district: 'الصناعية',
        address: 'طريق الظهران–الجبيل السريع، الصناعية، الدمام',
        googleMapsUrl: 'https://maps.app.goo.gl/bsSu4pHFkPk851nA6',
    },
    {
        id: 'dammam-saihat',
        name: 'فرع الدمام - سيهات',
        city: 'الدمام',
        region: 'المنطقة الشرقية',
        district: 'سيهات',
        address: 'الزهور، سيهات، الدمام',
        googleMapsUrl: 'https://maps.app.goo.gl/XhdvJjZPZvRFQUtWA',
    },
    {
        id: 'khobar',
        name: 'فرع الخبر',
        city: 'الخبر',
        region: 'المنطقة الشرقية',
        district: 'الخالدية الشمالية',
        address: 'طريق الملك فهد، الخالدية الشمالية',
        googleMapsUrl: 'https://maps.app.goo.gl/73xY2pWRfwZGNaeJA',
    },
]

export const REGIONS = [
    'الكل',
    'المنطقة الغربية',
    'المنطقة الوسطى',
    'المنطقة الشرقية',
    'منطقة القصيم',
    'منطقة حائل',
] as const

export type RegionFilter = typeof REGIONS[number]
