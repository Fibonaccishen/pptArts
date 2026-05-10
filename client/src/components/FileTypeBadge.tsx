import { Tag } from 'antd';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pptx: { label: 'PPTX', color: '#1677ff', bg: '#e6f4ff' },
  png:  { label: 'PNG',  color: '#52c41a', bg: '#f6ffed' },
  svg:  { label: 'SVG',  color: '#fa8c16', bg: '#fff7e6' },
};

export default function FileTypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type];
  if (!cfg) return null;
  return (
    <Tag
      style={{
        color: cfg.color,
        borderColor: cfg.color,
        background: cfg.bg,
        margin: 0,
        fontSize: 11,
        lineHeight: '18px',
      }}
    >
      {cfg.label}
    </Tag>
  );
}
