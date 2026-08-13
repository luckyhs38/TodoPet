import { useEffect, useRef, useState } from 'react';

import type { PetDirection } from '../../shared/types';

type PetMovementState = 'idle' | 'walk';

interface PetMovement {
  position: number;
  direction: PetDirection;
  state: PetMovementState;
  movePetTo(nextPosition: number): void;
}

const PET_WIDTH = 96;
const MOVEMENT_SPEED_PX_PER_SECOND = 80;
const IDLE_DURATION_SECONDS = { minimum: 2, maximum: 6 };
const WALK_DURATION_SECONDS = { minimum: 3, maximum: 8 };

function getRandomDuration(minimum: number, maximum: number): number {
  return (minimum + Math.random() * (maximum - minimum)) * 1000;
}

function getRandomDirection(): PetDirection {
  return Math.random() < 0.5 ? 'left' : 'right';
}

export function usePetMovement(isPaused = false): PetMovement {
  const isPausedRef = useRef(isPaused);
  const requestedPositionRef = useRef<number | null>(null);
  const [position, setPosition] = useState(() =>
    Math.max(0, window.innerWidth - PET_WIDTH),
  );
  const [direction, setDirection] = useState<PetDirection>('left');
  const [state, setState] = useState<PetMovementState>('idle');
  isPausedRef.current = isPaused;
  const movePetTo = (nextPosition: number): void => {
    const maximumX = Math.max(0, window.innerWidth - PET_WIDTH);
    const clampedPosition = Math.max(
      0,
      Math.min(nextPosition, maximumX),
    );

    requestedPositionRef.current = clampedPosition;
    setPosition(clampedPosition);
  };

  useEffect(() => {
    let animationFrameId = 0;
    let previousTime: number | undefined;
    let currentPosition = Math.max(0, window.innerWidth - PET_WIDTH);
    let currentDirection: PetDirection = 'left';
    let currentState: PetMovementState = 'idle';
    let pauseStartedAt: number | undefined;
    let stateEndsAt =
      performance.now() +
      getRandomDuration(
        IDLE_DURATION_SECONDS.minimum,
        IDLE_DURATION_SECONDS.maximum,
      );

    const enterIdle = (currentTime: number): void => {
      currentState = 'idle';
      setState(currentState);
      stateEndsAt =
        currentTime +
        getRandomDuration(
          IDLE_DURATION_SECONDS.minimum,
          IDLE_DURATION_SECONDS.maximum,
        );
    };

    const enterWalk = (currentTime: number): void => {
      currentState = 'walk';
      currentDirection = getRandomDirection();
      setState(currentState);
      setDirection(currentDirection);
      stateEndsAt =
        currentTime +
        getRandomDuration(
          WALK_DURATION_SECONDS.minimum,
          WALK_DURATION_SECONDS.maximum,
        );
    };

    const movePet = (currentTime: number): void => {
      const maximumX = Math.max(0, window.innerWidth - PET_WIDTH);

      if (requestedPositionRef.current !== null) {
        currentPosition = requestedPositionRef.current;
        requestedPositionRef.current = null;
      }

      currentPosition = Math.min(currentPosition, maximumX);

      if (isPausedRef.current) {
        if (pauseStartedAt === undefined) {
          pauseStartedAt = currentTime;
          setState('idle');
        }

        previousTime = currentTime;
        animationFrameId = requestAnimationFrame(movePet);
        return;
      }

      if (pauseStartedAt !== undefined) {
        stateEndsAt += currentTime - pauseStartedAt;
        pauseStartedAt = undefined;
        setState(currentState);
      }

      if (previousTime === undefined) previousTime = currentTime;
      const elapsedSeconds = (currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (currentTime >= stateEndsAt) {
        if (currentState === 'idle') enterWalk(currentTime);
        else enterIdle(currentTime);
      }

      if (currentState === 'walk') {
        const directionMultiplier = currentDirection === 'left' ? -1 : 1;
        currentPosition +=
          directionMultiplier * MOVEMENT_SPEED_PX_PER_SECOND * elapsedSeconds;

        if (currentPosition <= 0 || currentPosition >= maximumX) {
          currentPosition = Math.max(0, Math.min(currentPosition, maximumX));

          if (Math.random() < 0.5) {
            currentDirection = currentDirection === 'left' ? 'right' : 'left';
            setDirection(currentDirection);
          } else {
            enterIdle(currentTime);
          }
        }

        setPosition(currentPosition);
      }

      animationFrameId = requestAnimationFrame(movePet);
    };

    animationFrameId = requestAnimationFrame(movePet);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return { position, direction, state, movePetTo };
}
