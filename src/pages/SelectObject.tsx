import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { objectsData } from '../data/objects.data';
import ObjectViewer from '../components/ObjectViewer';
import { saveSelectedObject, clearSelectedObject } from '../utils/robotStorage';
import './Selection.css';

export default function SelectObject() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = useCallback(() => {
    const selected = objectsData.find(obj => obj.id === selectedId);
    if (selected) {
      saveSelectedObject(selected);
      navigate('/home');
    }
  }, [selectedId, navigate]);

  const handleSkip = useCallback(() => {
    clearSelectedObject();
    navigate('/home');
  }, [navigate]);

  return (
    <div className="selection-container" style={{ backgroundColor: '#F6F7F9' }}>
      {/* Top Navigation & Header */}
      <div className="selection-header">
        <div className="selection-header-left">
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="selection-header-center">
          <h1 className="selection-title">
            Select an Object
          </h1>
          <p className="selection-subtitle">
            Choose an object your robot will interact with in the scene.
          </p>
        </div>

        <div className="selection-header-right">
          <button
            onClick={handleSkip}
            className="skip-btn"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="selection-content">
        {objectsData.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
            <p>No objects available</p>
            <p>Upload or generate objects to begin</p>
          </div>
        ) : (
          <div className="object-grid">
            {objectsData.map((obj) => {
              const isSelected = selectedId === obj.id;
              return (
                <motion.div
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    borderColor: isSelected ? '#00376E' : 'transparent',
                    boxShadow: isSelected ? '0 8px 24px rgba(234, 241, 248, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <ObjectViewer objectType={obj.id as 'box' | 'cylinder' | 'sphere' | 'pallet'} />
                  </div>
                  <div style={{
                    fontSize: '18px',
                    lineHeight: '25px',
                    letterSpacing: '-1px',
                    fontWeight: 500,
                    color: '#374049'
                  }}>
                    {obj.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <div className="continue-btn-container">
          <button
            disabled={!selectedId}
            onClick={handleSelect}
            className="continue-btn"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}