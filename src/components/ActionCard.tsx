import { useEffect, useRef, useState } from 'react';
import type { ActionCardData } from '../data/robots.data';
import * as Icons from 'lucide-react';
import { Draggable } from '@dnd-kit/dom';
import { Sortable } from '@dnd-kit/dom/sortable';
import { manager } from '../utils/dnd';

interface ActionCardProps {
  action: ActionCardData;
  isOverlay?: boolean;
  isDraggable?: boolean;
  variant?: 'draggable' | 'sortable';
  instanceId?: string;
  index?: number;
  onDelete?: () => void;
}

export default function ActionCard({ action, isOverlay, isDraggable = true, variant = 'draggable', instanceId, index = 0, onDelete }: ActionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isDraggable || !ref.current || isOverlay) return;

    if (variant === 'sortable') {
      const sortable = new Sortable({
        id: instanceId || action.id,
        element: ref.current,
        data: { ...action, isSortable: true },
        index,
        group: 'canvas',
      }, manager);

      return () => {
        sortable.destroy();
      };
    } else {
      const draggable = new Draggable({
        id: action.id,
        element: ref.current,
        data: action,
      }, manager);

      return () => {
        draggable.destroy();
      };
    }
  }, [action.id, action, isOverlay, isDraggable, variant, instanceId, index]);

  const style = isOverlay ? {
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    transform: 'scale(1.05) rotate(2deg)',
    cursor: 'grabbing',
    opacity: 1,
    zIndex: 9999,
    pointerEvents: 'none' as const,
  } : {};

  // Dynamically resolve icon component (fallback to Circle if not found)
  const IconComponent = (Icons as any)[action.icon] || Icons.Circle;

  return (
    <div
      ref={ref}
      className={`card ${!isDraggable ? 'dropped' : ''}`}
      data-id={action.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        backgroundColor: !isDraggable ? '#ffffff' : action.theme.bgColor,
        border: `1px solid ${action.theme.borderColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isOverlay ? 'grabbing' : (isDraggable ? 'grab' : 'default'),
        userSelect: 'none',
        marginBottom: isOverlay || !isDraggable ? '0px' : '12px',
        touchAction: 'none'
      }}
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
        fontWeight: 500,
        flexGrow: 1
      }}>
        {action.label}
      </span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: '#a0aec0',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px'
          }}
          title="Remove action"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}
