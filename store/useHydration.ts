import { useSyncExternalStore } from "react";
import { useAppStore } from "./useAppStore";

const subscribe = (callback: () => void) =>  useAppStore.persist.onFinishHydration(callback);

const getSnapshot = () => useAppStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export function useHydration() {
    return useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    )
}