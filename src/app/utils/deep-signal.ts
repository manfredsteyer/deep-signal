import { WritableSignal, signal } from '@angular/core';

export type DeepSignal<Type> = WritableSignal<
  Type extends Array<object>
    ? Array<DeepSignal<Type[0]>>
    : Type extends Object
      ? {
          [Property in keyof Type]: DeepSignal<Type[Property]>;
        }
      : Type
>;

export function nest<T>(value: T): DeepSignal<T> {
  const signalMap = new Map<string | symbol, WritableSignal<unknown>>();

  if (typeof value === 'object') {
    const deep = Array.isArray(value)
      ? ([] as Array<DeepSignal<T>>)
      : ({} as Record<string, DeepSignal<T>>);

    for (const key of Object.keys(value as Record<string, unknown>)) {
      (deep as Record<string, unknown>)[key] = nest(
        (value as Record<string, unknown>)[key],
      );
    }
    return signal(deep) as DeepSignal<T>;
  } else {
    return signal(value) as DeepSignal<T>;
  }

  function getSignal(
    prop: string | symbol,
    target: T,
  ): WritableSignal<unknown> | undefined {
    if (!signalMap.has(prop)) {
      const value = (target as any)[prop];
      const isObject = typeof value === 'object';
      const s = isObject ? nest(value) : value;
      signalMap.set(prop, signal(s));
    }
    const s = signalMap.get(prop);
    return s;
  }
}

const n = nest({ x: 1, b: { c: 2 } });
console.log('n', n().b().c());
