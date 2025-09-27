import { api, Todo } from '@/utils/api';
import NetInfo from '@react-native-community/netinfo';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const queryClient = new QueryClient();

// definir mutation defaults globales
queryClient.setMutationDefaults(['todos'], {
    mutationFn: (todo: Todo) => {
        return api.updateTodo(todo);
    },
});

const storage = new MMKV();

const clientStorage = {
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value === undefined ? null : value;
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
};

// MMKV
const persister = createSyncStoragePersister({
    storage: clientStorage,
    throttleTime: 3000,
});

export default function RootLayout() {
    useEffect(() => {
        return NetInfo.addEventListener((state) => {
            const status = !!state.isConnected;
            onlineManager.setOnline(status);
            console.log(state.isConnected);
        });
    }, []);

    return (
        <PersistQueryClientProvider
            onSuccess={() =>
                queryClient
                    .resumePausedMutations()
                    .then(() => queryClient.invalidateQueries())
            }
            persistOptions={{ persister }}
            client={queryClient}
        >
            <Stack />
        </PersistQueryClientProvider>
    );
}
