import { clsx, type ClassValue } from 'clsx';
import { Application, Graphics } from 'pixi.js';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pixijsStuff = async (
  app: Application,
  element: HTMLDivElement
) => {
  await app.init({
    background: '#1099bb',
    resizeTo: element,
  });

  element.appendChild(app.canvas);

  const circle = app.stage.addChild(
    new Graphics()
      .circle(0, 0, 8)
      .fill({ color: 0xffffff })
      .stroke({ color: 0x111111, alpha: 0.87, width: 1 })
  );

  circle.position.set(app.screen.width / 2, app.screen.height / 2);

  // Enable interactivity!
  app.stage.eventMode = 'static';

  // Make sure the whole canvas area is interactive, not just the circle.
  app.stage.hitArea = app.screen;

  // Follow the pointer
  app.stage.addEventListener('pointermove', (e) => {
    circle.position.copyFrom(e.global);
  });
};
