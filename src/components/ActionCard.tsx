import { useDraggable } from '@dnd-kit/core';
import type { ActionCardData } from '../data/robots.data';
import * as Icons from 'lucide-react';

interface ActionCardProps {
  action: ActionCardData;
  isOverlay?: boolean;
}

export default function ActionCard({ action, isOverlay }: ActionCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: action.id,
    data: action,
    disabled: isOverlay
  });

  const style = isOverlay ? {
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    transform: 'scale(1.05) rotate(2deg)',
    cursor: 'grabbing',
    opacity: 1,
    zIndex: 9999,
    pointerEvents: 'none' as const,
  } : {
    opacity: isDragging ? 0.3 : 1,
  };

  // Dynamically resolve icon component (fallback to Circle if not found)
  const IconComponent = (Icons as any)[action.icon] || Icons.Circle;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={{
        ...style,
        backgroundColor: action.theme.bgColor,
        border: `1px solid ${action.theme.borderColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isOverlay ? 'grabbing' : (isDragging ? 'grabbing' : 'grab'),
        userSelect: 'none',
        marginBottom: isOverlay ? '0px' : '12px',
        touchAction: 'none'
      }}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: action.theme.iconBgColor,
        color: action.theme.iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <IconComponent size={18} />
      </div>
      <span style={{
        color: action.theme.textColor,
        fontSize: '14px',
        fontWeight: 500
      }}>
        {action.label}
      </span>
    </div>
  );
}
