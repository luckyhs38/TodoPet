import { useState } from 'react';

import { TodoPanel } from './components/TodoPanel';
import { useClickThrough } from './hooks/useClickThrough';
import { usePetMovement } from './hooks/usePetMovement';

export function App() {
  useClickThrough();
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  const { position, direction, state } = usePetMovement(isTodoPanelOpen);

  return (
    <main className="pet-stage">
      <button
        type="button"
        className="pet-placeholder"
        style={{ transform: `translateX(${position}px)` }}
        data-direction={direction}
        data-movement-state={state}
        data-pet-interactive="true"
        aria-label="투두 패널 열기 또는 닫기"
        aria-expanded={isTodoPanelOpen}
        aria-controls="todo-panel"
        onClick={() => setIsTodoPanelOpen((isOpen) => !isOpen)}
      >
        <span className="pet-sprite" role="img" aria-label="캐릭터" />
      </button>

      {isTodoPanelOpen && (
        <TodoPanel
          petPosition={position}
          onClose={() => setIsTodoPanelOpen(false)}
        />
      )}
    </main>
  );
}
