import { useClickThrough } from './hooks/useClickThrough';
import { usePetMovement } from './hooks/usePetMovement';

export function App() {
  useClickThrough();
  const { position, direction, state } = usePetMovement();

  return (
    <main className="pet-stage">
      <div
        className="pet-placeholder"
        style={{ transform: `translateX(${position}px)` }}
        data-direction={direction}
        data-movement-state={state}
        aria-label="임시 캐릭터"
        data-pet-interactive="true"
      >
        <span className="pet-sprite" role="img" aria-label="캐릭터" />
      </div>
    </main>
  );
}
