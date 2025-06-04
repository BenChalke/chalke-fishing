// src/components/FishDisplay.js
import React from 'react';
import Bubbles from './Bubbles';
import Fish    from './Fish';
import Hook    from './Hook';
import CatchAnimation from './CatchAnimation';

const FISH_SIZE = 120;

export default function FishDisplay({
  fishArray,
  isMobile,
  cursorPos,
  isJerking,
  isCatching,
  catchAnimations,
  onFishClick,
  onCatchAnimationEnd,
  speed,            // <— receive global speed from App
}) {
  return (
    <>
      {/* 1) Bubbles in the background */}
      <Bubbles />

      {/* 2) Render all live fish; pass angle & speed */}
      {fishArray.map((fish) => {
        const isSuper = ['crimson', 'cyan'].includes(fish.colour);
        return (
          <Fish
            key={fish.id}
            id={fish.id}
            x={fish.x}
            y={fish.y}
            size={isSuper ? FISH_SIZE * 1.5 : FISH_SIZE}
            colour={fish.colour}
            pattern={fish.pattern}
            angle={fish.angle}      // <— pass angle so Fish can flip
            speed={speed}           // <— pass speed so Fish can wag tail faster/slower
            onClick={(e) => onFishClick(fish.id, e)}
            isMobile={isMobile}
          />
        );
      })}

      {/* 3) Hook as cursor (desktop only) */}
      {!isCatching && !isMobile && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* 4) Caught-fish animations */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => onCatchAnimationEnd(anim.id)}
        >
          <Hook x={anim.startX} y={anim.startY} jerking={false} />
          <Fish
            x={0}
            y={0}
            size={FISH_SIZE}
            colour={anim.colour}
            pattern={anim.pattern}
            angle={0}
            speed={speed}
            isDead={true}
            isMobile={isMobile}
          />
        </CatchAnimation>
      ))}
    </>
  );
}
