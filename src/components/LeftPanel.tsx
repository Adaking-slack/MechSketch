import type { Robot } from '../data/robots.data';
import ActionCard from './ActionCard';

interface LeftPanelProps {
  robot?: Robot;
}

export default function LeftPanel({ robot }: LeftPanelProps) {
  const actions = robot?.actions || [];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: '22px', 
        fontWeight: 600, 
        color: '#374049', 
        lineHeight: '31px',
        letterSpacing: '-1px'
      }}>
        Action Cards
      </h2>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {actions.length > 0 ? (
          actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))
        ) : (
          <div style={{ color: '#a0aec0', fontSize: '14px' }}>
            No actions available for {robot?.name || 'this robot'}.
          </div>
        )}
      </div>
    </div>
  );
}
