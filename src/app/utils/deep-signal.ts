import { Signal, WritableSignal, isSignal, signal } from '@angular/core';

export type DeepSignal<Type> = WritableSignal<
  Type extends Array<object>
    ? Array<DeepSignal<Type[0]>>
    : Type extends Object
      ? {
          [Property in keyof Type]: DeepSignal<Type[Property]>;
        }
      : Type
>;

export function deepSignal<T>(value: T): DeepSignal<T> {
  if (value !== null && typeof value === 'object') {
    const deep = Array.isArray(value)
      ? ([] as Array<DeepSignal<T>>)
      : ({} as Record<string, DeepSignal<T>>);

    for (const key of Object.keys(value as Record<string, unknown>)) {
      (deep as Record<string, unknown>)[key] = deepSignal(
        (value as Record<string, unknown>)[key],
      );
    }
    return signal(deep) as DeepSignal<T>;
  } else {
    return signal(value) as DeepSignal<T>;
  }
}

export function deepLazy<T>(value: T): DeepSignal<T> {
  if (value !== null && typeof value === 'object') {
    const deep = Array.isArray(value)
      ? ([] as Array<DeepSignal<T>>)
      : ({} as Record<string, DeepSignal<T>>);

    for (const key of Object.keys(value as Record<string, unknown>)) {
      Object.defineProperty(deep, key, {
        enumerable: true,
        get: () => {
          return deepSignal((value as Record<string, unknown>)[key]);
        },
      });
    }
    return signal(deep) as DeepSignal<T>;
  } else {
    return signal(value) as DeepSignal<T>;
  }
}

export function flatten<T>(deep: DeepSignal<T> | Signal<T>): T {
  const value = deep();

  if (typeof value !== 'object' || !value) {
    return value as T;
  }

  let result = Array.isArray(value) ? ([] as T) : ({} as T);
  for (const key of Object.keys(value)) {
    if (isSignal((value as Record<string, unknown>)[key])) {
      (result as Record<string, unknown>)[key] = flatten(
        (value as Record<string, Signal<unknown>>)[key],
      );
    } else {
      (result as Record<string, unknown>)[key] = (
        value as Record<string, unknown>
      )[key];
    }
  }
  return result;
}
