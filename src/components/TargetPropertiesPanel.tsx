import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Redo, Undo, Plus, Minus, ChevronsUpDown } from 'lucide-react';
import type { Target, TargetSize } from '../utils/robotStorage';
import { updateTarget } from '../utils/robotStorage';

interface TargetPropertiesPanelProps {
  target: Target;
  onBack: () => void;
  onTargetUpdate: (target: Target) => void;
}

interface PositionControlProps {
  label1: string;
  icon1: React.ReactNode;
  onClick1: () => void;

  value: number;
  onChange: (val: number) => void;

  label2: string;
  icon2: React.ReactNode;
  onClick2: () => void;
}

function PositionControl({ label1, icon1, onClick1, value, onChange, label2, icon2, onClick2 }: PositionControlProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
      <button onClick={onClick1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon1}
        </div>
        <span style={{ fontSize: '10px', lineHeight: '16px', color: '#656768', marginTop: '4px' }}>{label1}</span>
      </button>

      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="number"
          value={Number(value).toString()} // Avoid trailing zeros
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '13px', lineHeight: '18px', color: '#374049', outline: 'none' }}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <ChevronsUpDown size={16} color="#374049" />
        </div>
      </div>

      <button onClick={onClick2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon2}
        </div>
        <span style={{ fontSize: '10px', lineHeight: '16px', color: '#656768', marginTop: '4px' }}>{label2}</span>
      </button>
    </div>
  );
}

interface SizeControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

function SizeControl({ label, value, onChange }: SizeControlProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <span style={{ fontSize: '13px', lineHeight: '18px', color: '#374049', width: '40px' }}>{label}</span>

      <button onClick={() => onChange(value + 0.05)} style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EAEAEA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      <button onClick={() => onChange(Math.max(0.05, value - 0.05))} style={{ backgroundColor: '#F6F7F9', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EAEAEA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={20} color="#374049" />
      </button>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', borderRadius: '12px 12px 0 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px', borderBottom: '1px solid #EAEAEA' }}>
        <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '25px', letterSpacing: '-1px', color: '#001529', fontWeight: 600 }}>
          {target.type === 'point' ? 'Target point' : 'Target zone'}
        </h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
          <X size={20} color="#001529" />
        </button>
      </div>

      <div style={{ padding: '20px 0px', flex: 1, overflowY: 'auto' }}>
        {/* Name Section */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', lineHeight: '18px', color: '#656768', marginBottom: '8px' }}>Name</label>
          <input
            type="text"
            value={target.name}
            onChange={(e) => {
              const updated = { ...target, name: e.target.value };
              updateTarget(target.id, updated);
              onTargetUpdate(updated);
            }}
            style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', backgroundColor: '#F6F7F9', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#374049', outline: 'none' }}
          />
        </div>

        {/* Position Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 16px 0' }}>Position</h3>

          <PositionControl
            label1="Left"
            icon1={<ArrowLeft size={20} color="#374049" />}
            onClick1={() => handlePositionChange('x', target.position.x - 0.05)}
            value={target.position.x}
            onChange={(val) => handlePositionChange('x', val)}
            label2="right"
            icon2={<ArrowRight size={20} color="#374049" />}
            onClick2={() => handlePositionChange('x', target.position.x + 0.05)}
          />

          <PositionControl
            label1="Up"
            icon1={<ArrowUp size={20} color="#374049" />}
            onClick1={() => handlePositionChange('y', target.position.y + 0.05)}
            value={target.position.y}
            onChange={(val) => handlePositionChange('y', val)}
            label2="down"
            icon2={<ArrowDown size={20} color="#374049" />}
            onClick2={() => handlePositionChange('y', target.position.y - 0.05)}
          />

          <PositionControl
            label1="fwd"
            icon1={<Redo size={20} color="#374049" />}
            onClick1={() => handlePositionChange('z', target.position.z - 0.05)}
            value={target.position.z}
            onChange={(val) => handlePositionChange('z', val)}
            label2="bwd"
            icon2={<Undo size={20} color="#374049" />}
            onClick2={() => handlePositionChange('z', target.position.z + 0.05)}
          />
        </div>

        {/* Size Section */}
        {target.type === 'zone' && (
          <div>
            <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 16px 0' }}>Size</h3>

            <SizeControl
              label="Width"
              value={target.size?.width ?? 0.2}
              onChange={(val) => handleSizeChange('width', val)}
            />

            <SizeControl
              label="Depth"
              value={target.size?.depth ?? 0.2}
              onChange={(val) => handleSizeChange('depth', val)}
            />
          </div>
        )}
      </div>

      <div style={{ padding: '2px', backgroundColor: '#FFFFFF' }}>
        <button onClick={onBack} style={{ width: '100%', backgroundColor: '#00376E', color: '#ECF5FE', padding: '10px 0', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </div>
  );
}