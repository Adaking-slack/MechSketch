import { useLocation, useNavigate } from 'react-router-dom';

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRobot = location.state?.selectedRobot;

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Planner</h1>
      {selectedRobot ? (
        <div>
          <h2>Active Robot: {selectedRobot.name}</h2>
          <p>Tag: {selectedRobot.tag}</p>
          <button onClick={() => navigate('/')}>Back to Selection</button>
        </div>
      ) : (
        <div>
          <p>No robot selected!</p>
          <button onClick={() => navigate('/')}>Select a Robot</button>
        </div>
      )}
    </div>
  );
}
