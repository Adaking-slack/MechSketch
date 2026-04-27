import { useState } from 'react';
import { Plus, X, Crosshair, Square } from 'lucide-react';
import type { Robot, ActionCardData } from '../data/robots.data';
import ActionCard from './ActionCard';
import type { Target, TargetType } from '../utils/robotStorage';

interface LeftPanelProps {
  robot?: Robot | null;
  onActionClick?: (action: ActionCardData) => void;
  targets?: Target[];
  selectedTargetId?: string | null;
  onTargetSelect?: (id: string) => void;
  onAddTarget?: (type: TargetType) => void;
  onDeleteTarget?: (id: string) => void;
  highlightAddTarget?: boolean;
  onDismissHighlight?: () => void;
}



function AddTargetMenu({ onClose, onAddTarget }: { onClose: () => void; onAddTarget: (type: TargetType) => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      height: '100%',
      backgroundColor: '#ffffff',
      boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#374049' }}>Add Target</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#4a5568' }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => { onAddTarget('point'); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
        >
          <Crosshair size={20} color="#10B981" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374049' }}>Target Point</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Single coordinate for precise placement</div>
          </div>
        </button>
        <button
          onClick={() => { onAddTarget('zone'); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
        >
          <Square size={20} color="#8B5CF6" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374049' }}>Target Zone</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Area for flexible placement</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function LeftPanel({ 
  robot, 
  onActionClick,
  targets = [],
  selectedTargetId,
  onTargetSelect,
  onAddTarget,
  onDeleteTarget,
  highlightAddTarget = false,
}: LeftPanelProps) {
  const [showAddTarget, setShowAddTarget] = useState(false);

  const allActions = robot ? [...(robot.primaryActions || []), ...(robot.secondaryActions || [])] : [];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showAddTarget && (
        <>
          <div onClick={() => setShowAddTarget(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
          <AddTargetMenu onClose={() => setShowAddTarget(false)} onAddTarget={onAddTarget!} />
        </>
      )}

      <h2 style={{ margin: '0 0 24px 0', fontSize: '15px', fontWeight: 600, color: '#374049', lineHeight: '31px', letterSpacing: '-1px' }}>
        Action Cards
      </h2>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {!robot ? (
          <div style={{ color: '#a0aec0', fontSize: '14px' }}>Select a robot to view available actions</div>
        ) : allActions.length > 0 ? (
          allActions.map((action) => (
            <ActionCard key={action.id} action={action} onClick={() => onActionClick?.(action)} />
          ))
        ) : (
          <div style={{ color: '#a0aec0', fontSize: '14px' }}>No actions available for {robot.name}.</div>
        )}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4a5568' }}>Targets</h3>
          <button
            onClick={() => setShowAddTarget(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: highlightAddTarget ? '#00376E' : 'transparent',
              border: `2px solid ${highlightAddTarget ? '#00376E' : '#e2e8f0'}`,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: highlightAddTarget ? '#ffffff' : '#4a5568',
              cursor: 'pointer',
              boxShadow: highlightAddTarget ? '0 0 0 3px rgba(0, 55, 110, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={12} />Add Target
          </button>
        </div>
        {highlightAddTarget && (
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#E8F0F8',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#00376E',
            fontWeight: 500,
          }}>
            Click here to add a target
          </div>
        )}

        {targets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {targets.map((target) => (
              <div
                key={target.id}
                onClick={() => onTargetSelect?.(target.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: selectedTargetId === target.id ? '#E8F0F8' : '#F8F9FA', border: `1px solid ${selectedTargetId === target.id ? '#0B3A6E' : '#EAEAEA'}`, borderRadius: '6px', cursor: 'pointer' }}
              >
                {target.type === 'point' ? <Crosshair size={14} color={target.color} /> : <Square size={14} color={target.color} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374049' }}>{target.name}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {target.type === 'point' 
                      ? `X:${target.position.x} Y:${target.position.y} Z:${target.position.z}`
                      : `${target.size?.width}x${target.size?.depth}`
                    }
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTarget?.(target.id); }}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#aaa', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#a0aec0', fontSize: '13px', padding: '8px 0' }}>No targets defined</div>
        )}
      </div>
    </div>
  );
}