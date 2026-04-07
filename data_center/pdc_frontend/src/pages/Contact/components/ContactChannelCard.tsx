import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Mail } from 'lucide-react'
import type { ContactChannel } from '../data/contactInfo'

const iconMap = { Phone, MessageCircle, Mail }

interface Props {
    channel: ContactChannel
    index: number
}

export default function ContactChannelCard({ channel, index }: Props) {
    const [hovered, setHovered] = useState(false)
    const Icon = iconMap[channel.icon]

    return (
        <motion.a
            href={channel.href}
            target={channel.type === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                textDecoration: 'none',
                background: 'var(--color-surface)',
                border: `1.5px solid ${hovered ? channel.color + '60' : 'var(--color-border)'}`,
                borderRadius: 20,
                padding: '36px 28px',
                gap: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered ? `0 12px 36px ${channel.color}20` : 'none',
            }}
        >
            {/* Icon */}
            <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: channel.color + '18',
                border: `1.5px solid ${channel.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
                transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}>
                <Icon size={28} style={{ color: channel.color }} />
            </div>

            {/* Title */}
            <h3 style={{
                fontSize: 18, fontWeight: 700, margin: 0,
                color: 'var(--color-text-primary)',
            }}>
                {channel.title}
            </h3>

            {/* Value */}
            <p style={{
                fontSize: 16, fontWeight: 600, margin: 0,
                color: channel.color,
                direction: 'ltr',
                letterSpacing: channel.type === 'email' ? '0' : '0.03em',
            }}>
                {channel.value}
            </p>

            {/* Description */}
            <p style={{
                fontSize: 13, color: 'var(--color-text-secondary)',
                lineHeight: 1.7, margin: 0,
            }}>
                {channel.description}
            </p>
        </motion.a>
    )
}
