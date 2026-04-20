import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#f7f8f9',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Left Panel */}
      <aside style={{
        width: leftOpen ? '320px' : '0px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: leftOpen ? '1px solid #e2e8f0' : 'none',
        boxShadow: leftOpen ? '4px 0 16px rgba(0,0,0,0.02)' : 'none',
        zIndex: 10,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ width: '320px', padding: '24px', boxSizing: 'border-box', height: '100%' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Left Panel</h3>
          {/* Placeholder for left panel content */}
        </div>
      </aside>

      {/* Left Toggle Button */}
      <button 
        onClick={() => setLeftOpen(!leftOpen)}
        style={{
          position: 'absolute',
          left: leftOpen ? '306px' : '16px',
          top: '24px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#4a5568'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {leftOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Center Canvas Area */}
      <main style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0 // Prevents layout breakage
      }}>
        <div style={{ color: '#a0aec0', fontWeight: 500 }}>
          3D Canvas Area
        </div>
      </main>

      {/* Right Toggle Button */}
      <button 
        onClick={() => setRightOpen(!rightOpen)}
        style={{
          position: 'absolute',
          right: rightOpen ? '306px' : '16px',
          top: '24px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#4a5568'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {rightOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Right Panel */}
      <aside style={{
        width: rightOpen ? '320px' : '0px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: rightOpen ? '1px solid #e2e8f0' : 'none',
        boxShadow: rightOpen ? '-4px 0 16px rgba(0,0,0,0.02)' : 'none',
        zIndex: 10,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ width: '320px', padding: '24px', boxSizing: 'border-box', height: '100%' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Right Panel</h3>
          {/* Placeholder for right panel content */}
        </div>
      </aside>
    </div>
  );
}
