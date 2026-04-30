import { useCallback } from 'react';
import type { ActionCardData } from '../data/robots.data';
import * as Icons from 'lucide-react';

interface ActionCardProps {
  action: ActionCardData;
  isOverlay?: boolean;
  isDraggable?: boolean;
  variant?: 'draggable' | 'sortable';
  instanceId?: string;
  index?: number;
  onDelete?: () => void;
  onClick?: () => void;
}

export default function ActionCard({ action, isOverlay, isDraggable = true, variant: _variant, instanceId: _instanceId, index: _index, onDelete, onClick }: ActionCardProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const style = isOverlay ? {
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    transform: 'scale(1.05) rotate(2deg)',
    cursor: 'grabbing',
    opacity: 1,
    zIndex: 9999,
  } : {
    backgroundColor: '#ffffff',
    border: `1px solid ${action.theme.borderColor}`,
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none' as React.CSSProperties["userSelect"],
    marginBottom: isOverlay || !isDraggable ? 0 : '12px',
  };

  const IconComponent = (Icons as any)[action.icon] || Icons.Circle;

  return (
    <div
      onClick={handleClick}
      style={{
        ...style,
        touchAction: 'manipulation',
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
        flexShrink: 0,
      }}>
        <IconComponent size={18} />
      </div>
      <span style={{
        color: action.theme.textColor,
        fontSize: '15px',
        fontWeight: 400,
        flexGrow: 1,
      }}>
        {action.label}
      </span>
      {onDelete && (
        <button
          onClick={handleDelete}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: '#a0aec0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px',
          }}
          title="Remove action"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}