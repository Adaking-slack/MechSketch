import { createContext, useContext, useState, ReactNode } from 'react';

export type RobotAction = 'pick' | 'place' | 'weld' | 'assemble' | 'rotate' | 'lift' | string;

interface RobotActionContextType {
  currentAction: RobotAction | null;
  executeAction: (actionId: string) => void;
  clearAction: () => void;
}

const RobotActionContext = createContext<RobotActionContextType | undefined>(undefined);

export function RobotActionProvider({ children }: { children: ReactNode }) {
  const [currentAction, setCurrentAction] = useState<RobotAction | null>(null);

  const executeAction = (actionId: string) => {
    console.log(`[RobotActionContext] Executing action: ${actionId}`);
    
    // Extract a normalized action name from the ID (e.g. 'action-pick' -> 'pick')
    const normalizedAction = actionId.replace('action-', '').replace('-scara', '');
    
    setCurrentAction(normalizedAction);
    
    // Auto-clear action after a delay (simulating action completion)
    setTimeout(() => {
      setCurrentAction(null);
    }, 2000);
  };

  const clearAction = () => setCurrentAction(null);

  return (
    <RobotActionContext.Provider value={{ currentAction, executeAction, clearAction }}>
      {children}
    </RobotActionContext.Provider>
  );
}

export function useRobotAction() {
  const context = useContext(RobotActionContext);
  if (context === undefined) {
    throw new Error('useRobotAction must be used within a RobotActionProvider');
  }
  return context;
}
