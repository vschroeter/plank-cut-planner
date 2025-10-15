import type { Store } from 'pinia'

// Temporarily disable auto recompute during bulk imports, then restore
export async function withAutoRecomputeDisabled<T> (
  store: Store & { autoRecompute: boolean, toggleAutoRecompute: (value?: boolean) => void },
  fn: () => Promise<T> | T,
): Promise<T> {
  const prev = store.autoRecompute
  if (prev) {
    store.toggleAutoRecompute(false)
  }
  try {
    return await Promise.resolve(fn())
  } finally {
    if (prev) {
      store.toggleAutoRecompute(true)
    }
  }
}
