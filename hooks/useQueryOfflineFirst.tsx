import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Tipado de las opciones que recibe el hook
 * - queryKey: clave única para identificar el recurso en React Query (ej: ['todos'])
 * - fetchFn: función que trae la lista de entidades desde la API (ej: api.getTodos)
 * - createFn: función que crea una entidad en la API (ej: api.createTodo)
 * - updateFn: función que actualiza una entidad en la API (ej: api.updateTodo)
 * - deleteFn: función que elimina una entidad en la API (ej: api.deleteTodo)
 * - idKey: el campo que identifica de manera única cada entidad (ej: 'id')
 */
type UseQueryOfflineFirstOptions<T> = {
    queryKey: string[];
    fetchFn: () => Promise<T[]>;
    createFn?: (entity: T) => Promise<T>;
    updateFn?: (entity: T) => Promise<T>;
    deleteFn?: (entity: T) => Promise<void>;
    idKey: keyof T;
};

/**
 * Hook genérico para manejar entidades offline-first con React Query.
 * - Soporta lectura (listado), creación, actualización y eliminación.
 * - Usa actualizaciones optimistas: primero actualiza el cache local, luego sincroniza con la API.
 * - Si no hay internet, React Query pausará las mutaciones y las reintentará cuando vuelva la conexión.
 */
export function useQueryOfflineFirst<T extends Record<string, any>>({
    queryKey,
    fetchFn,
    createFn,
    updateFn,
    deleteFn,
    idKey,
}: UseQueryOfflineFirstOptions<T>) {
    const queryClient = useQueryClient();

    // ================================
    // 🔹 1. Query principal (leer lista)
    // ================================
    const { data, isPending, error, refetch } = useQuery({
        queryKey,
        queryFn: fetchFn,
        staleTime: Infinity, // nunca se considera "viejo", salvo que vos lo invalides
    });

    // ================================
    // 🔹 2. Helpers para modificar el cache local
    // ================================
    const addLocalEntity = (entity: T, isSynced: boolean) => {
        queryClient.setQueryData<T[]>(queryKey, (list = []) => [
            ...list,
            { ...entity, isSynced },
        ]);
    };

    const updateLocalEntity = (
        id: T[keyof T],
        patch: Partial<T>,
        isSynced: boolean
    ) => {
        queryClient.setQueryData<T[]>(queryKey, (list) =>
            list?.map((item) =>
                item[idKey] === id ? { ...item, ...patch, isSynced } : item
            )
        );
    };

    const deleteLocalEntity = (id: T[keyof T]) => {
        queryClient.setQueryData<T[]>(queryKey, (list) =>
            list?.filter((item) => item[idKey] !== id)
        );
    };

    // ================================
    // 🔹 3. Mutación para creación
    // ================================
    const createMutation = useMutation({
        mutationKey: [...queryKey, 'create'],
        mutationFn: createFn!,
        onMutate: async (entity: T) => {
            // cancelamos queries en curso para evitar inconsistencias
            await queryClient.cancelQueries({ queryKey });
            // agregamos localmente (optimista, marcado como no sincronizado)
            addLocalEntity(entity, false);
        },
        onSuccess: (data, variables) => {
            // cuando el server confirma, actualizamos el item a "sincronizado"
            updateLocalEntity(variables[idKey], data, true);
        },
    });

    // ================================
    // 🔹 4. Mutación para actualización
    // ================================
    const updateMutation = useMutation({
        mutationKey: [...queryKey, 'update'],
        mutationFn: updateFn!,
        onMutate: async (entity: T) => {
            await queryClient.cancelQueries({ queryKey });
            // optimist update → aplicamos el cambio local y marcamos como no sincronizado
            updateLocalEntity(entity[idKey], entity, false);
        },
        onSuccess: (data, variables) => {
            // cuando llega respuesta del server, lo marcamos como sincronizado
            updateLocalEntity(variables[idKey], data, true);
        },
    });

    // ================================
    // 🔹 5. Mutación para eliminación
    // ================================
    const deleteMutation = useMutation({
        mutationKey: [...queryKey, 'delete'],
        mutationFn: deleteFn!,
        onMutate: async (entity: T) => {
            await queryClient.cancelQueries({ queryKey });
            // lo quitamos del cache inmediatamente (optimista)
            deleteLocalEntity(entity[idKey]);
        },
        // si falla, lo podrías reinsertar, pero acá lo dejamos simple
    });

    // ================================
    // 🔹 6. Funciones públicas
    // ================================
    const createEntity = (entity: T) => createMutation.mutate(entity);
    const updateEntity = (entity: T) => updateMutation.mutate(entity);
    const deleteEntity = (entity: T) => deleteMutation.mutate(entity);

    return {
        data, // lista de entidades
        isPending, // estado de carga inicial
        error, // error si falla el fetch
        refetch, // función para refrescar manualmente
        createEntity, // función para crear (optimista + sync)
        updateEntity, // función para actualizar (optimista + sync)
        deleteEntity, // función para eliminar (optimista + sync)
    };
}
