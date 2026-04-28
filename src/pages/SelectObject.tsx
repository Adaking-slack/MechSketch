import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { objectsData } from '../data/objects.data';
import ObjectViewer from '../components/ObjectViewer';
import { saveSelectedObject, clearSelectedObject } from '../utils/robotStorage';

export default function SelectObject() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = useCallback(() => {
    const selected = objectsData.find(obj => obj.id === selectedId);
    if (selected) {
      saveSelectedObject(selected);
      if (location.state?.flowType === 'editing') {
        navigate('/home');
      } else {
        navigate('/planner');
      }
    }
  }, [selectedId, navigate, location.state?.flowType]);

  const handleSkip = useCallback(() => {
    // Navigate without saving an object
    clearSelectedObject();
    if (location.state?.flowType === 'editing') {
      navigate('/home');
    } else {
      navigate('/planner');
    }
  }, [navigate, location.state?.flowType]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#F6F7F9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            lineHeight: '18px',
            color: '#374049',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            lineHeight: '18px',
            color: '#374049',
            padding: 0
          }}
        >
          Skip for now
        </button>
      </div>

      {/* Header Section */}
      <div style={{ textAlign: 'center', marginTop: '', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '22px',
          lineHeight: '31px',
          letterSpacing: '-1px',
          fontWeight: 700,
          color: '#374049',
          margin: '0 0 8px 0'
        }}>
          Select an Object
        </h1>
        <p style={{
          fontSize: '15px',
          lineHeight: '23px',
          letterSpacing: '-0.5px',
          fontWeight: 400,
          color: '#374049',
          margin: 0
        }}>
          Choose an object your robot will interact with in the scene.
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 24px',
        overflowY: 'auto'
      }}>
        {objectsData.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
            <p>No objects available</p>
            <p>Upload or generate objects to begin</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            maxWidth: '1000px',
            width: '100%',
            justifyContent: 'center'
          }}>
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
        <div style={{ width: '100%', marginTop: '32px', marginBottom: '48px', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button
            disabled={!selectedId}
            onClick={handleSelect}
            style={{
              padding: '10px 80px',
              backgroundColor: '#00376E',
              color: '#ECF5FE',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '23px',
              cursor: 'pointer',
              opacity: selectedId ? 1 : 0.5,
              transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
            onMouseOver={(e) => {
              if (selectedId) {
                e.currentTarget.style.backgroundColor = '#012950';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#00376E';
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}