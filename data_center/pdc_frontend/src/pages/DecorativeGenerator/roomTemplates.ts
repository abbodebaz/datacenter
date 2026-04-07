export interface RoomTemplate {
  id: string
  name_ar: string
  name_en: string
  base_prompt: string
  recommended_for: string[]
  default_settings: {
    lighting: string
    camera_angle: string
    design_style: string
    aspect_ratio: string
    mood: string
  }
  available_for_modes: ('surface' | 'product')[]
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'living_modern',
    name_ar: 'صالة عصرية',
    name_en: 'Modern Living Room',
    base_prompt: 'spacious modern living room with large windows, contemporary furniture',
    recommended_for: ['tiles', 'marble', 'parquet'],
    default_settings: {
      lighting: 'natural',
      camera_angle: 'corner',
      design_style: 'modern',
      aspect_ratio: '16:9',
      mood: 'warm',
    },
    available_for_modes: ['surface'],
  },
  {
    id: 'living_luxury',
    name_ar: 'صالة فاخرة',
    name_en: 'Luxury Living Room',
    base_prompt: 'luxurious high-end living room with premium materials and dramatic lighting',
    recommended_for: ['marble', 'premium_tiles'],
    default_settings: {
      lighting: 'dramatic',
      camera_angle: 'corner',
      design_style: 'luxury',
      aspect_ratio: '16:9',
      mood: 'elegant',
    },
    available_for_modes: ['surface'],
  },
  {
    id: 'bathroom_modern',
    name_ar: 'حمام عصري',
    name_en: 'Modern Bathroom',
    base_prompt: 'modern spa-like bathroom with walk-in shower, floating vanity',
    recommended_for: ['tiles', 'porcelain', 'marble'],
    default_settings: {
      lighting: 'soft',
      camera_angle: 'corner',
      design_style: 'modern',
      aspect_ratio: '4:3',
      mood: 'calm',
    },
    available_for_modes: ['surface', 'product'],
  },
  {
    id: 'bathroom_luxury',
    name_ar: 'حمام فاخر',
    name_en: 'Luxury Bathroom',
    base_prompt: 'luxurious master bathroom with freestanding tub, marble surfaces',
    recommended_for: ['marble', 'premium_tiles', 'faucets', 'bathtubs'],
    default_settings: {
      lighting: 'warm',
      camera_angle: 'eye_level',
      design_style: 'luxury',
      aspect_ratio: '16:9',
      mood: 'elegant',
    },
    available_for_modes: ['surface', 'product'],
  },
  {
    id: 'kitchen_modern',
    name_ar: 'مطبخ عصري',
    name_en: 'Modern Kitchen',
    base_prompt: 'modern open kitchen with island, sleek cabinets',
    recommended_for: ['tiles', 'porcelain', 'faucets'],
    default_settings: {
      lighting: 'natural',
      camera_angle: 'corner',
      design_style: 'modern',
      aspect_ratio: '16:9',
      mood: 'warm',
    },
    available_for_modes: ['surface', 'product'],
  },
  {
    id: 'outdoor_patio',
    name_ar: 'فناء خارجي',
    name_en: 'Outdoor Patio',
    base_prompt: 'beautiful outdoor patio with seating area and garden view',
    recommended_for: ['outdoor_tiles', 'furniture', 'umbrellas', 'grass'],
    default_settings: {
      lighting: 'natural',
      camera_angle: 'corner',
      design_style: 'contemporary',
      aspect_ratio: '16:9',
      mood: 'warm',
    },
    available_for_modes: ['surface', 'product'],
  },
  {
    id: 'pool_area',
    name_ar: 'منطقة مسبح',
    name_en: 'Pool Area',
    base_prompt: 'luxury pool area with lounging space and landscape',
    recommended_for: ['pool_tiles', 'outdoor_furniture', 'umbrellas'],
    default_settings: {
      lighting: 'natural',
      camera_angle: 'eye_level',
      design_style: 'modern',
      aspect_ratio: '16:9',
      mood: 'calm',
    },
    available_for_modes: ['surface', 'product'],
  },
  {
    id: 'entrance_lobby',
    name_ar: 'مدخل / لوبي',
    name_en: 'Entrance Lobby',
    base_prompt: 'grand entrance foyer with high ceilings and statement lighting',
    recommended_for: ['marble', 'tiles', 'natural_stone'],
    default_settings: {
      lighting: 'dramatic',
      camera_angle: 'eye_level',
      design_style: 'luxury',
      aspect_ratio: '9:16',
      mood: 'elegant',
    },
    available_for_modes: ['surface'],
  },
  {
    id: 'bedroom_cozy',
    name_ar: 'غرفة نوم مريحة',
    name_en: 'Cozy Bedroom',
    base_prompt: 'cozy elegant bedroom with warm tones and soft textiles',
    recommended_for: ['parquet', 'carpet', 'wallpaper'],
    default_settings: {
      lighting: 'warm',
      camera_angle: 'eye_level',
      design_style: 'contemporary',
      aspect_ratio: '16:9',
      mood: 'cozy',
    },
    available_for_modes: ['surface'],
  },
  {
    id: 'office_modern',
    name_ar: 'مكتب عصري',
    name_en: 'Modern Office',
    base_prompt: 'professional modern office with clean design',
    recommended_for: ['tiles', 'parquet', 'vinyl'],
    default_settings: {
      lighting: 'natural',
      camera_angle: 'corner',
      design_style: 'modern',
      aspect_ratio: '16:9',
      mood: 'energetic',
    },
    available_for_modes: ['surface'],
  },
]

export const getTemplatesForMode = (mode: 'surface' | 'product'): RoomTemplate[] => {
  return ROOM_TEMPLATES.filter((t) => t.available_for_modes.includes(mode))
}
