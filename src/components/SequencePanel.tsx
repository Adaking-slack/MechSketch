import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { SequenceBlock, BlockType } from '../data/robots.data';
import { getBlockSummary } from '../data/robots.data';
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
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SequenceBlockItem({ block, isActive, onSelect, onDelete }: SequenceBlockItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = (Icons as any)[block.icon] || Icons.Circle;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        backgroundColor: isActive ? '#E8F0F8' : '#F8F9FA',
        border: `1px solid ${isActive ? '#0B3A6E' : '#EAEAEA'}`,
        borderRadius: '8px',
        cursor: 'pointer',
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
  );
}

export default function SequencePanel({
  blocks,
  activeBlockId,
  onBlockSelect,
  onBlockDelete,
}: SequencePanelProps) {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
            {blocks.map((block, index) => (
              <div key={block.instanceId} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <SequenceBlockItem
                  block={block}
                  index={index}
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
        )}
      </div>
    </div>
  );
}