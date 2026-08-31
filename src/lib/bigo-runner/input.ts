// Swipe input handler
// Supports touch and mouse. Left/right = lane switch, up = jump, down = roll.

export type SwipeDirection = "left" | "right" | "up" | "down" | null;

export interface InputCallbacks {
  onSwipe: (direction: SwipeDirection) => void;
}

const SWIPE_THRESHOLD = 24; // pixels
const MAX_SWITCH_DURATION = 200; // ms

export class InputHandler {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private isTracking = false;
  private callbacks: InputCallbacks;
  private el: HTMLElement;
  private cleanupFns: (() => void)[] = [];

  constructor(el: HTMLElement, callbacks: InputCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.bind();
  }

  private bind() {
    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.startTime = Date.now();
      this.isTracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!this.isTracking) return;
      this.isTracking = false;
      const touch = e.changedTouches[0];
      this.processSwipe(touch.clientX, touch.clientY);
    };

    // Mouse events (for desktop testing)
    const onMouseDown = (e: MouseEvent) => {
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startTime = Date.now();
      this.isTracking = true;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!this.isTracking) return;
      this.isTracking = false;
      this.processSwipe(e.clientX, e.clientY);
    };

    // Keyboard (for desktop testing)
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          this.callbacks.onSwipe("left");
          break;
        case "ArrowRight":
        case "d":
          this.callbacks.onSwipe("right");
          break;
        case "ArrowUp":
        case "w":
        case " ":
          this.callbacks.onSwipe("up");
          break;
        case "ArrowDown":
        case "s":
          this.callbacks.onSwipe("down");
          break;
      }
    };

    this.el.addEventListener("touchstart", onTouchStart, { passive: true });
    this.el.addEventListener("touchend", onTouchEnd, { passive: true });
    this.el.addEventListener("mousedown", onMouseDown);
    this.el.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);

    this.cleanupFns.push(
      () => this.el.removeEventListener("touchstart", onTouchStart),
      () => this.el.removeEventListener("touchend", onTouchEnd),
      () => this.el.removeEventListener("mousedown", onMouseDown),
      () => this.el.removeEventListener("mouseup", onMouseUp),
      () => window.removeEventListener("keydown", onKeyDown),
    );
  }

  private processSwipe(endX: number, endY: number) {
    const dx = endX - this.startX;
    const dy = endY - this.startY;
    const duration = Date.now() - this.startTime;

    if (duration > MAX_SWITCH_DURATION) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      this.callbacks.onSwipe(dx > 0 ? "right" : "left");
    } else {
      this.callbacks.onSwipe(dy > 0 ? "down" : "up");
    }
  }

  destroy() {
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
  }
}
