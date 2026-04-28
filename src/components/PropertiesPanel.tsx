import { X, Plus, Minus, ChevronsUpDown } from 'lucide-react';
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

  // Pick the params keys this block uses for an XYZ destination.
  const fieldKeys: { x: keyof BlockParams; y: keyof BlockParams; z: keyof BlockParams } | null =
    type === 'place'
      ? { x: 'targetX', y: 'targetY', z: 'targetZ' }
      : type === 'move' || type === 'pick' || type === 'inspect'
      ? { x: 'x', y: 'y', z: 'z' }
      : null;

  const handleTargetPick = (target: Target) => {
    if (!fieldKeys) return;
    onParamsChange({
      ...params,
      targetId: target.id,
      [fieldKeys.x]: target.position.x,
      [fieldKeys.y]: target.position.y,
      [fieldKeys.z]: target.position.z,
    });
    onTargetSelect?.(target.id);
  };

  const renderTargetPicker = () => {
    if (!fieldKeys) return null;
    if (targets.length === 0) {
      return (
        <div style={{ padding: '16px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
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
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', margin: '0 0 8px 0' }}>
          {type === 'place' ? 'Place at' : type === 'pick' ? 'Pick from' : 'Move to'}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {targets.map((target) => (
            <button
              key={target.id}
              onClick={() => handleTargetPick(target)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: '#F6F7F9',
                border: `1px solid ${params.targetId === target.id ? '#00376E' : '#EAEAEA'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: target.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#374049' }}>{target.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  X:{target.position.x.toFixed(2)} Y:{target.position.y.toFixed(2)} Z:{target.position.z.toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
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
            {renderTargetPicker()}
            <ParamField label="X" value={params.x ?? 0} onChange={(v) => handleChange('x', v)} step={0.05} labelWidth="20px" />
            <ParamField label="Y" value={params.y ?? 0} onChange={(v) => handleChange('y', v)} step={0.05} labelWidth="20px" />
            <ParamField label="Z" value={params.z ?? 0} onChange={(v) => handleChange('z', v)} step={0.05} labelWidth="20px" />
          </>
        );
      case 'place':
        return (
          <>
            {renderTargetPicker()}
            <ParamField label="X" value={params.targetX ?? 0} onChange={(v) => handleChange('targetX', v)} step={0.05} labelWidth="20px" />
            <ParamField label="Y" value={params.targetY ?? 0} onChange={(v) => handleChange('targetY', v)} step={0.05} labelWidth="20px" />
            <ParamField label="Z" value={params.targetZ ?? 0} onChange={(v) => handleChange('targetZ', v)} step={0.05} labelWidth="20px" />
          </>
        );
      case 'wait':
        return (
          <ParamField label="Duration" value={params.duration ?? 1} onChange={(v) => handleChange('duration', v)} step={0.5} />
        );
      case 'rotate':
        return (
          <>
            <ParamField label="Angle" value={params.angle ?? 90} onChange={(v) => handleChange('angle', v)} step={15} labelWidth="40px" />
            <AxisField value={params.axis ?? 'Z'} onChange={(v) => handleChange('axis', v)} labelWidth="40px" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', borderRadius: '16px 16px 0 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px', borderBottom: '1px solid #EAEAEA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001529' }}>
            <IconComponent size={20} />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '25px', letterSpacing: '-1px', color: '#001529', fontWeight: 600 }}>
            {label}
          </h2>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
          <X size={20} color="#001529" />
        </button>
      </div>

      <div style={{ padding: '20px 0px', flex: 1, overflowY: 'auto' }}>
        {/* Parameters Section */}
        <div>
          <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 16px 0' }}>Parameters</h3>
          {renderFields()}
        </div>
      </div>

      <div style={{ padding: '2px', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAEAEA' }}>
        <button onClick={onBack} style={{ width: '100%', backgroundColor: '#00376E', color: '#ECF5FE', padding: '10px 0', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </div>
  );
}

interface ParamFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  labelWidth?: string;
}

function ParamField({ label, value, onChange, step = 1, labelWidth = '60px' }: ParamFieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <span style={{ fontSize: '13px', lineHeight: '18px', color: '#374049', width: labelWidth }}>{label}</span>
      
      <button onClick={() => onChange(value + step)} style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EAEAEA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={20} color="#374049" />
      </button>

      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="number"
          value={Number(value).toString()}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '13px', lineHeight: '18px', color: '#374049', outline: 'none' }}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <ChevronsUpDown size={16} color="#374049" />
        </div>
      </div>

      <button onClick={() => onChange(value - step)} style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EAEAEA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={20} color="#374049" />
      </button>
    </div>
  );
}

interface AxisFieldProps {
  value: 'X' | 'Y' | 'Z';
  onChange: (value: 'X' | 'Y' | 'Z') => void;
  labelWidth?: string;
}

function AxisField({ value, onChange, labelWidth = '60px' }: AxisFieldProps) {
  const axes: ('X' | 'Y' | 'Z')[] = ['X', 'Y', 'Z'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <span style={{ fontSize: '13px', lineHeight: '18px', color: '#374049', width: labelWidth }}>Axis</span>
      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
        {axes.map((axis) => (
          <button
            key={axis}
            onClick={() => onChange(axis)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `1px solid ${value === axis ? '#00376E' : '#EAEAEA'}`,
              borderRadius: '8px',
              backgroundColor: value === axis ? '#00376E' : '#F6F7F9',
              color: value === axis ? '#ECF5FE' : '#374049',
              fontSize: '13px',
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