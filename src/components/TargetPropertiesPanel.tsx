import { ChevronLeft, Minus, Plus } from 'lucide-react';
import type { Target, TargetSize } from '../utils/robotStorage';
import { updateTarget } from '../utils/robotStorage';

interface TargetPropertiesPanelProps {
  target: Target;
  onBack: () => void;
  onTargetUpdate: (target: Target) => void;
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

function NumberInput({ label, value, onChange, step = 0.05 }: NumberInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label style={{ fontSize: '11px', color: '#888' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onChange(value - step)}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#f8f9fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a5568',
          }}
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '0',
            fontSize: '13px',
            outline: 'none',
            textAlign: 'center',
            minWidth: 0,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#0B3A6E'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
        />
        <button
          onClick={() => onChange(value + step)}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #e2e8f0',
            borderRadius: '0 4px 4px 0',
            borderLeft: 'none',
            backgroundColor: '#f8f9fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a5568',
          }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

export default function TargetPropertiesPanel({
  target,
  onBack,
  onTargetUpdate,
}: TargetPropertiesPanelProps) {
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const updated = {
      ...target,
      position: { ...target.position, [axis]: value },
    };
    updateTarget(target.id, updated);
    onTargetUpdate(updated);
  };

  const handleSizeChange = (dim: 'width' | 'depth', value: number) => {
    const width = target.size?.width ?? 0.2;
    const depth = target.size?.depth ?? 0.2;
    const newSize: TargetSize = {
      width: dim === 'width' ? Math.max(0.05, value) : width,
      depth: dim === 'depth' ? Math.max(0.05, value) : depth,
    };
    const updated = { ...target, size: newSize };
    updateTarget(target.id, updated);
    onTargetUpdate(updated);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          padding: '8px 0',
          cursor: 'pointer',
          color: '#4a5568',
          fontSize: '14px',
        }}
      >
        <ChevronLeft size={16} />
        Back to Sequence
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: '#F6F7F9',
        border: '1px solid #EAEAEA',
        borderRadius: '8px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: target.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {target.type === 'point' ? (
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />
          ) : (
            <div style={{ width: '12px', height: '8px', border: '2px solid white', borderRadius: '1px' }} />
          )}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374049' }}>
          {target.type === 'point' ? 'Target Point' : 'Target Zone'}
        </span>
      </div>

      <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Name
      </div>
      <input
        type="text"
        value={target.name}
        onChange={(e) => {
          const updated = { ...target, name: e.target.value };
          updateTarget(target.id, updated);
          onTargetUpdate(updated);
        }}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
          marginBottom: '16px',
          width: '100%',
        }}
      />

      <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Position
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <NumberInput label="X (Left/Right)" value={target.position.x} onChange={(v) => handlePositionChange('x', v)} step={0.05} />
        <NumberInput label="Y (Up/Down)" value={target.position.y} onChange={(v) => handlePositionChange('y', v)} step={0.05} />
        <NumberInput label="Z (Fwd/Back)" value={target.position.z} onChange={(v) => handlePositionChange('z', v)} step={0.05} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handlePositionChange('x', target.position.x - 0.05)}
          style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8f9fa', fontSize: '11px', color: '#666', cursor: 'pointer' }}
        >
          ←X
        </button>
        <button
          onClick={() => handlePositionChange('x', target.position.x + 0.05)}
          style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8f9fa', fontSize: '11px', color: '#666', cursor: 'pointer' }}
        >
          X→
        </button>
        <button
          onClick={() => handlePositionChange('z', target.position.z - 0.05)}
          style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8f9fa', fontSize: '11px', color: '#666', cursor: 'pointer' }}
        >
          ←Z
        </button>
        <button
          onClick={() => handlePositionChange('z', target.position.z + 0.05)}
          style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8f9fa', fontSize: '11px', color: '#666', cursor: 'pointer' }}
        >
          Z→
        </button>
      </div>

      {target.type === 'zone' && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '16px' }}>
            Size
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <NumberInput label="Width" value={target.size?.width ?? 0.2} onChange={(v) => handleSizeChange('width', v)} step={0.01} />
            <NumberInput label="Depth" value={target.size?.depth ?? 0.2} onChange={(v) => handleSizeChange('depth', v)} step={0.01} />
          </div>
        </>
      )}

      <div style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '6px', fontSize: '11px', color: '#666' }}>
        <strong>Quick Move:</strong> Use arrow buttons or +/- to move the target in the workspace. Changes update in real-time.
      </div>
    </div>
  );
}