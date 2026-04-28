import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Redo, Undo, ChevronsUpDown } from 'lucide-react';
import type { PlacedObject, Target } from '../utils/robotStorage';
import { updatePlacedObject } from '../utils/robotStorage';

interface ObjectPropertiesPanelProps {
  object: PlacedObject;
  targets: Target[];
  onBack: () => void;
  onObjectUpdate: (object: PlacedObject) => void;
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
          step="0.05"
          value={Number(value).toString()}
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

export default function ObjectPropertiesPanel({
  object,
  targets,
  onBack,
  onObjectUpdate,
}: ObjectPropertiesPanelProps) {
  const clampScale = (value: number) => {
    if (!Number.isFinite(value)) return 0.05;
    return Math.max(0.05, Number(value.toFixed(3)));
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const updated: PlacedObject = {
      ...object,
      position: { ...object.position, [axis]: value },
    };
    updatePlacedObject(object.id, updated);
    onObjectUpdate(updated);
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const updated: PlacedObject = {
      ...object,
      scale: { ...object.scale, [axis]: clampScale(value) },
    };
    updatePlacedObject(object.id, updated);
    onObjectUpdate(updated);
  };

  const snapToTarget = (target: Target) => {
    const y = target.type === 'zone' ? target.position.y + 0.16 : target.position.y;
    const updated: PlacedObject = {
      ...object,
      position: { x: target.position.x, y, z: target.position.z },
    };
    updatePlacedObject(object.id, updated);
    onObjectUpdate(updated);
  };

  const objectName = object.objectData.name || object.objectData.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', borderRadius: '12px 12px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px', borderBottom: '1px solid #EAEAEA' }}>
        <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '25px', letterSpacing: '-1px', color: '#001529', fontWeight: 600 }}>
          {objectName}
        </h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
          <X size={20} color="#001529" />
        </button>
      </div>

      <div style={{ padding: '20px 0px', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 16px 0' }}>Position</h3>

          <PositionControl
            label1="Left"
            icon1={<ArrowLeft size={20} color="#374049" />}
            onClick1={() => handlePositionChange('x', object.position.x - 0.05)}
            value={object.position.x}
            onChange={(val) => handlePositionChange('x', val)}
            label2="right"
            icon2={<ArrowRight size={20} color="#374049" />}
            onClick2={() => handlePositionChange('x', object.position.x + 0.05)}
          />

          <PositionControl
            label1="Up"
            icon1={<ArrowUp size={20} color="#374049" />}
            onClick1={() => handlePositionChange('y', object.position.y + 0.05)}
            value={object.position.y}
            onChange={(val) => handlePositionChange('y', val)}
            label2="down"
            icon2={<ArrowDown size={20} color="#374049" />}
            onClick2={() => handlePositionChange('y', object.position.y - 0.05)}
          />

          <PositionControl
            label1="fwd"
            icon1={<Redo size={20} color="#374049" />}
            onClick1={() => handlePositionChange('z', object.position.z - 0.05)}
            value={object.position.z}
            onChange={(val) => handlePositionChange('z', val)}
            label2="bwd"
            icon2={<Undo size={20} color="#374049" />}
            onClick2={() => handlePositionChange('z', object.position.z + 0.05)}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 16px 0' }}>Size</h3>

          <PositionControl
            label1="Narrower"
            icon1={<ArrowLeft size={20} color="#374049" />}
            onClick1={() => handleScaleChange('x', object.scale.x - 0.02)}
            value={object.scale.x}
            onChange={(val) => handleScaleChange('x', val)}
            label2="Wider"
            icon2={<ArrowRight size={20} color="#374049" />}
            onClick2={() => handleScaleChange('x', object.scale.x + 0.02)}
          />

          <PositionControl
            label1="Shorter"
            icon1={<ArrowDown size={20} color="#374049" />}
            onClick1={() => handleScaleChange('y', object.scale.y - 0.02)}
            value={object.scale.y}
            onChange={(val) => handleScaleChange('y', val)}
            label2="Taller"
            icon2={<ArrowUp size={20} color="#374049" />}
            onClick2={() => handleScaleChange('y', object.scale.y + 0.02)}
          />

          <PositionControl
            label1="Shallower"
            icon1={<Undo size={20} color="#374049" />}
            onClick1={() => handleScaleChange('z', object.scale.z - 0.02)}
            value={object.scale.z}
            onChange={(val) => handleScaleChange('z', val)}
            label2="Deeper"
            icon2={<Redo size={20} color="#374049" />}
            onClick2={() => handleScaleChange('z', object.scale.z + 0.02)}
          />
        </div>

        {targets.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', lineHeight: '18px', color: '#4C4D4E', fontWeight: 500, margin: '0 0 12px 0' }}>Snap to target</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => snapToTarget(t)}
                  style={{ textAlign: 'left', padding: '10px 12px', backgroundColor: '#F6F7F9', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '13px', color: '#374049', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                  <span style={{ color: '#656768', marginLeft: '6px' }}>
                    ({t.position.x.toFixed(2)}, {t.position.y.toFixed(2)}, {t.position.z.toFixed(2)})
                  </span>
                </button>
              ))}
            </div>
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
