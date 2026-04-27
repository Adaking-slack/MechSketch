import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { SequenceBlock, BlockType } from '../data/robots.data';
import { getBlockSummary } from '../data/robots.data';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import * as Icons from 'lucide-react';

interface SequencePanelProps {
  blocks: SequenceBlock[];
  activeBlockId: string | null;
  onBlockSelect: (instanceId: string) => void;
  onBlockDelete: (instanceId: string) => void;
  onBlockReorder: (blocks: SequenceBlock[]) => void;
}

interface SequenceBlockItemProps {
  block: SequenceBlock;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, isActive, onSelect, onDelete }: SequenceBlockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.instanceId });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = (Icons as any)[block.icon] || Icons.Circle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      {...attributes}
      {...listeners}
      className="sortable-block-item"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: isActive ? '#E8F0F8' : '#F8F9FA',
          border: `1px solid ${isActive ? '#0B3A6E' : '#EAEAEA'}`,
          borderRadius: '8px',
          cursor: 'grab',
          transition: 'all 0.15s',
          userSelect: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          backgroundColor: block.theme.iconBgColor,
          color: block.theme.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconComponent size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: block.theme.textColor,
            marginBottom: '2px',
          }}>
            {block.label}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#888',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {getBlockSummary(block.type as BlockType, block.params)}
          </div>
        </div>
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
            color: '#aaa',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Remove"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SequencePanel({
  blocks,
  activeBlockId,
  onBlockSelect,
  onBlockDelete,
  onBlockReorder,
}: SequencePanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.instanceId === active.id);
      const newIndex = blocks.findIndex((b) => b.instanceId === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onBlockReorder(newBlocks);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '13px',
        fontWeight: 600,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Sequence
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          backgroundColor: '#F9FAFB',
          border: '1px dashed #e2e8f0',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {blocks.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '120px',
            color: '#aaa',
            fontSize: '13px',
            textAlign: 'center',
            padding: '20px',
          }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#999' }}>
              No blocks added
            </div>
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: '1.4' }}>
              Click or drag action blocks<br />to build your sequence
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.instanceId)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
                {blocks.map((block, index) => (
                  <div key={block.instanceId} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <SortableBlockItem
                      block={block}
                      isActive={activeBlockId === block.instanceId}
                      onSelect={() => onBlockSelect(block.instanceId)}
                      onDelete={() => onBlockDelete(block.instanceId)}
                    />
                    {index < blocks.length - 1 && (
                      <ChevronRight size={16} color="#ddd" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}