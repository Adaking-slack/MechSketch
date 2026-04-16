import RobotCarousel from '../components/RobotCarousel';

export default function SelectRobot() {
  return (
    <div style={{ padding: '2rem 1rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sys-colors-surfaces-surface-primary, #121212)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 'var(--sys-font-headings-h1-heavy-fontsize, 48px)',
          fontWeight: 'var(--sys-font-headings-h1-heavy-fontweight, 900)'
        }}>
          Select a Robot
        </h1>
        <p style={{ 
          marginTop: '8px', 
          fontSize: 'var(--sys-font-body-body-regular-fontsize, 15px)',
          color: 'var(--sys-colors-text-text-secondary, #aaa)' 
        }}>
          Choose a robot to start planning your task sequence
        </p>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <RobotCarousel />
      </div>
    </div>
  );
}
