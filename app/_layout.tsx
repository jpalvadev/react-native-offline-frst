import { api, Todo } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// definir mutation defaults globales
queryClient.setMutationDefaults(['todos'], {
    mutationFn: (todo: Todo) => {
        return api.updateTodo(todo);
    },
});

const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
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
