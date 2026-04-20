import RobotCarousel from '../components/RobotCarousel';

export default function SelectRobot() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #f5f5f5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 30 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--sys-colors-text-text-primary, #1a1a1a)' }}>
          Select a Robot
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--sys-colors-text-text-secondary, #666)', margin: 0 }}>
          Choose a robot to start planning your task sequence
        </p>
      </div>
      <RobotCarousel />
    </div>
  );
}
