import sys

file = 'c:/Users/emeli/MechSketch/src/pages/Home.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

index = content.find('      {showSaveModal && (')
if index != -1:
    content = content[:index] + '''      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowSaveModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Save Simulation
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
              Enter a name for this simulation:
            </p>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Enter simulation name"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                color: '#1a1a1a',
                outline: 'none',
                marginBottom: '20px',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#00376E'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  const savedSimulation: SavedSimulation = {
                    id: currentSaveId || `sim-${Date.now()}`,
                    name: saveName || `${projectName} - ${new Date().toLocaleString()}`,
                    projectName: projectName,
                    savedAt: new Date().toISOString(),
                    targets: targets,
                    sequenceBlocks: sequenceBlocks,
                    state: simState || initSimState(objectState.objects, targets),
                    robotId: selectedRobot?.id,
                    robotModelUrl: selectedRobot?.model,
                  };
                  saveSimulation(savedSimulation);
                  setCurrentSaveId(savedSimulation.id);
                  setShowSaveModal(false);
                  setSimMessage('Work saved successfully');
                  setTimeout(() => setSimMessage(null), 2000);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#00376E',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Save File
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleDeleteProjectCancel}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Delete Project?
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
              This will permanently delete the project "{projectName}" and all saved simulations. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteProjectCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={handleDeleteProjectConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
