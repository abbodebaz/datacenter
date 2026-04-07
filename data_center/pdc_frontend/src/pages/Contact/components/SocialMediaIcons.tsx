import { motion } from 'framer-motion'
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react'
import type { SocialChannel } from '../data/contactInfo'

/* ─── Custom SVGs for platforms not in lucide-react ─── */
const TikTokIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} role="img">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.77a8.18 8.18 0 0 0 4.78 1.52V6.84a4.85 4.85 0 0 1-1.01-.15z" />
    </svg>
)

const SnapchatIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} role="img">
        <path d="M12.065 2C9.605 2 7.4 3.053 5.937 4.948c-.97 1.24-1.452 2.78-1.417 4.29-.001.11-.005.227-.01.342-.13.065-.29.108-.497.136a1.47 1.47 0 0 0-.337.08c-.316.116-.507.332-.509.588-.002.255.188.49.515.624.06.024.124.045.19.063.31.086.504.192.574.313.05.085.05.188-.003.316-.22.533-.676 1.072-1.235 1.445-.3.197-.45.433-.434.672.013.186.12.357.304.48.244.163.602.26.99.26.145 0 .295-.012.44-.037.315-.052.564-.046.726.017.175.07.307.22.43.437.12.21.245.403.383.568.558.673 1.3 1.022 2.161 1.034.41.006.82-.077 1.25-.254.37-.152.754-.23 1.143-.23.388 0 .77.078 1.138.23.43.177.842.26 1.252.254.862-.012 1.603-.361 2.161-1.034.138-.165.263-.358.383-.568.123-.217.255-.367.43-.437.16-.063.41-.069.726-.017.145.025.295.037.44.037.388 0 .746-.097.99-.26.184-.123.29-.294.304-.48.016-.24-.134-.475-.434-.672-.559-.373-1.015-.912-1.235-1.445-.053-.128-.053-.231-.004-.316.07-.12.264-.227.575-.313.065-.018.13-.039.19-.063.326-.134.517-.369.515-.624-.002-.256-.193-.472-.51-.588a1.47 1.47 0 0 0-.336-.08c-.208-.028-.368-.07-.498-.136-.005-.115-.009-.232-.01-.342.035-1.51-.447-3.05-1.417-4.29C16.6 3.053 14.395 2 11.935 2z" />
    </svg>
)

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    Instagram: ({ size, color }) => <Instagram size={size} style={{ color }} />,
    Twitter: ({ size, color }) => <Twitter size={size} style={{ color }} />,
    Facebook: ({ size, color }) => <Facebook size={size} style={{ color }} />,
    Youtube: ({ size, color }) => <Youtube size={size} style={{ color }} />,
    TikTok: TikTokIcon,
    Snapchat: SnapchatIcon,
}

interface Props {
    channels: SocialChannel[]
}

export default function SocialMediaIcons({ channels }: Props) {
    return (
        <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: 16,
            maxWidth: 760, margin: '0 auto',
        }}>
            {channels.map((channel, index) => {
                const Icon = iconMap[channel.icon]
                return (
                    <motion.a
                        key={channel.id}
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${channel.name} — ${channel.handle}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        whileHover={{ scale: 1.07, y: -4 }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            width: 108, padding: '18px 12px',
                            background: 'var(--color-surface)',
                            border: '1.5px solid var(--color-border)',
                            borderRadius: 18, textDecoration: 'none',
                            gap: 8, transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = channel.color + '60'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${channel.color}22`
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                        }}
                    >
                        <div style={{
                            width: 46, height: 46, borderRadius: 12,
                            background: channel.color + '18',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {Icon && <Icon size={22} color={channel.color} />}
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            textAlign: 'center',
                        }}>
                            {channel.name}
                        </span>
                        <span style={{
                            fontSize: 10, color: 'var(--color-text-muted)',
                            textAlign: 'center',
                        }}>
                            {channel.handle}
                        </span>
                    </motion.a>
                )
            })}
        </div>
    )
}
