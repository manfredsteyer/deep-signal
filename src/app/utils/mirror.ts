import { computed, signal, Signal, untracked } from '@angular/core';
import { nest } from './deep-signal';

export interface MirrorSignal<T> {
  (): T;

  set(value: T): void;
}

export function mirror<T>(outer: Signal<T>): MirrorSignal<T> {
  const inner = computed(() => signal(outer()));
  const mirrorSignal: MirrorSignal<T> = () => inner()();
  mirrorSignal.set = (value: T) => untracked(inner).set(value);
  return mirrorSignal;
}

export function deepMirror<T>(outer: Signal<T>) {
  return computed(() => nest(outer())());
}
