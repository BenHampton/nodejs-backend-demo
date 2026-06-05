type Cleanup = () => Promise<unknown>

const cleanups: Array<() => Promise<unknown>> = [];

// Integrations call this on import to register their teardown
export const onShutdown = (fn: Cleanup) => {
    cleanups.push(fn)
}

// server.ts run these while draining
export const runCleanups = () => {
    return Promise.allSettled(cleanups.map(c => c()))
}