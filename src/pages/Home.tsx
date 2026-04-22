import { useState, useEffect, useRef, Fragment } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import LeftPanel from '../components/LeftPanel';
import ActionCard from '../components/ActionCard';
import { robotsData } from '../data/robots.data';
import type { ActionCardData } from '../data/robots.data';
import { Droppable } from '@dnd-kit/dom';
import { isSortableOperation } from '@dnd-kit/dom/sortable';
import { manager } from '../utils/dnd';

export interface DroppedAction extends ActionCardData {
  instanceId: string;
}

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  
  // Dummy state for selected robot
  const [selectedRobot] = useState(robotsData[0]);
  
  // State for actions dropped in the canvas
  const [droppedActions, setDroppedActions] = useState<DroppedAction[]>([]);

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!dropZoneRef.current) return;

    const droppable = new Droppable({
      id: 'canvas-area',
      element: dropZoneRef.current,
    }, manager);

    const unsubscribeDragStart = manager.monitor.addEventListener('dragstart', (e: any) => {
      console.log('[dragstart] source:', e?.operation?.source?.id);
    });

    const unsubscribeDragOver = manager.monitor.addEventListener('dragover', (e: any) => {
      if (e?.operation?.target?.id === 'canvas-area') {
        setIsOver(true);
      } else {
        setIsOver(false);
      }
    });

    const unsubscribeDragEnd = manager.monitor.addEventListener('dragend', (e: any) => {
      setIsOver(false);
      if (e.canceled) return;
      
      const operation = e?.operation;
      if (!operation || !operation.source || !operation.target) return;

      if (isSortableOperation(operation)) {
        // Reordering within the canvas
        const { source, target } = operation;
        if (source.id !== target.id) {
          setDroppedActions((prev) => {
            const oldIndex = prev.findIndex(item => item.instanceId === source.id);
            const newIndex = prev.findIndex(item => item.instanceId === target.id);
            if (oldIndex !== -1 && newIndex !== -1) {
              const newItems = [...prev];
              const [movedItem] = newItems.splice(oldIndex, 1);
              newItems.splice(newIndex, 0, movedItem);
              return newItems;
            }
            return prev;
          });
        }
      } else {
        // Dropping from left panel
        const sourceData = operation.source.data;
        if (sourceData && !sourceData.isSortable) {
          if (operation.target.id === 'canvas-area' || operation.target.data?.isSortable) {
            setDroppedActions((prev) => {
              const newItem = { ...sourceData, instanceId: `${sourceData.id}-${Date.now()}` } as DroppedAction;
              
              if (operation.target.data?.isSortable) {
                const targetIndex = prev.findIndex(i => i.instanceId === operation.target.id);
                if (targetIndex !== -1) {
                  const newItems = [...prev];
                  newItems.splice(targetIndex, 0, newItem);
                  return newItems;
                }
              }
              return [...prev, newItem];
            });
          }
        }
      }
    });

    return () => {
      droppable.destroy();
      unsubscribeDragStart();
      unsubscribeDragOver();
      unsubscribeDragEnd();
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#f7f8f9',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#2b6cb0', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            M
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1a202c', letterSpacing: '-0.02em' }}>MechSketch</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#2b6cb0', fontSize: '14px', fontWeight: 600 }}>Dashboard</a>
            <a href="#" style={{ textDecoration: 'none', color: '#718096', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>Projects</a>
            <a href="#" style={{ textDecoration: 'none', color: '#718096', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>Settings</a>
          </nav>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#edf2f7',
            border: 'none',
            cursor: 'pointer',
            color: '#4a5568',
            transition: 'background-color 0.2s'
          }}>
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
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
          <LeftPanel robot={selectedRobot} />
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
      <main 
        id="canvas-drop-zone"
        ref={dropZoneRef}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0, // Prevents layout breakage
          backgroundColor: isOver ? 'rgba(43, 108, 176, 0.05)' : 'transparent',
          border: isOver ? '2px solid green' : '2px dashed transparent',
          transition: 'all 0.2s ease',
          margin: '24px',
          borderRadius: '16px'
        }}
      >
        <canvas id="canvas" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}></canvas>
        {droppedActions.length === 0 ? (
          <div style={{ color: '#a0aec0', fontWeight: 500, pointerEvents: 'none' }}>
            Drop actions here to build sequence
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '24px', alignItems: 'center', justifyContent: 'center' }}>
            {droppedActions.map((action, index) => (
              <Fragment key={action.instanceId}>
                <ActionCard 
                  action={action} 
                  variant="sortable"
                  instanceId={action.instanceId}
                  index={index}
                  onDelete={() => setDroppedActions((prev) => prev.filter(item => item.instanceId !== action.instanceId))}
                />
                {/* Arrow to the next action if not the last one */}
                {index < droppedActions.length - 1 && (
                  <ChevronRight size={20} color="#cbd5e0" />
                )}
              </Fragment>
            ))}
          </div>
        )}
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
    </div>
  );
}
