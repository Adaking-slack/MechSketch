import { ChevronLeft } from 'lucide-react';
import type { BlockType, BlockParams } from '../data/robots.data';
import type { Target } from '../utils/robotStorage';
import * as Icons from 'lucide-react';

interface PropertiesPanelProps {
  type: BlockType;
  label: string;
  icon: string;
  params: BlockParams;
  onParamsChange: (params: BlockParams) => void;
  onBack: () => void;
  targets?: Target[];
  selectedTargetId?: string | null;
  onTargetSelect?: (id: string) => void;
}

export default function PropertiesPanel({
  type,
  label,
  icon,
  params,
  onParamsChange,
  onBack,
  targets = [],
  onTargetSelect,
}: PropertiesPanelProps) {
  const IconComponent = (Icons as any)[icon] || Icons.Circle;

  const handleChange = (key: keyof BlockParams, value: number | string) => {
    onParamsChange({ ...params, [key]: value });
  };

  const renderPlaceFields = () => {
    if (type !== 'place') return null;

    const hasTargets = targets.length > 0;

    if (!hasTargets) {
      return (
        <div style={{ padding: '16px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#92400E', marginBottom: '4px' }}>
            No targets available
          </div>
          <div style={{ fontSize: '12px', color: '#B45309' }}>
            Add a target first in the left panel
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>Select Target</div>
        {targets.map((target) => (
          <button
            key={target.id}
            onClick={() => {
              handleChange('targetId', target.id);
              onTargetSelect?.(target.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: params.targetId === target.id ? '#E8F0F8' : '#F8F9FA',
              border: `1px solid ${params.targetId === target.id ? '#0B3A6E' : '#EAEAEA'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: target.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#374049' }}>{target.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                X:{target.position.x} Y:{target.position.y} Z:{target.position.z}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderFields = () => {
    switch (type) {
      case 'move':
      case 'pick':
      case 'inspect':
        return (
          <>
            <ParamField label="X" value={params.x ?? 0} onChange={(v) => handleChange('x', v)} />
            <ParamField label="Y" value={params.y ?? 0} onChange={(v) => handleChange('y', v)} />
            <ParamField label="Z" value={params.z ?? 0} onChange={(v) => handleChange('z', v)} />
          </>
        );
      case 'place':
        return renderPlaceFields();
      case 'wait':
        return (
          <ParamField label="Duration (s)" value={params.duration ?? 1} onChange={(v) => handleChange('duration', v)} />
        );
      case 'rotate':
        return (
          <>
            <ParamField label="Angle (°)" value={params.angle ?? 90} onChange={(v) => handleChange('angle', v)} />
            <AxisField value={params.axis ?? 'Z'} onChange={(v) => handleChange('axis', v)} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
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
          marginBottom: '16px',
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
        marginBottom: '20px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#374049',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <IconComponent size={18} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374049' }}>
          {label}
        </span>
      </div>

      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '12px',
      }}>
        Parameters
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {renderFields()}
      </div>
    </div>
  );
}

interface ParamFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function ParamField({ label, value, onChange }: ParamFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', color: '#666' }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#0B3A6E'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
      />
    </div>
  );
}

interface AxisFieldProps {
  value: 'X' | 'Y' | 'Z';
  onChange: (value: 'X' | 'Y' | 'Z') => void;
}

function AxisField({ value, onChange }: AxisFieldProps) {
  const axes: ('X' | 'Y' | 'Z')[] = ['X', 'Y', 'Z'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', color: '#666' }}>Axis</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {axes.map((axis) => (
          <button
            key={axis}
            onClick={() => onChange(axis)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `1px solid ${value === axis ? '#0B3A6E' : '#e2e8f0'}`,
              borderRadius: '6px',
              backgroundColor: value === axis ? '#0B3A6E' : '#fff',
              color: value === axis ? '#fff' : '#374049',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {axis}
          </button>
        ))}
      </div>
    </div>
  );
}