import RobotCarousel from '../components/RobotCarousel';

export default function SelectRobot() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f5f5f5', // Light gray background matching the image
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <RobotCarousel />
    </div>
  );
}
