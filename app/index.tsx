import TodoItem from '@/components/TodoItem';
import { api, Todo } from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlatList, View } from 'react-native';

export default function Index() {
    const queryClient = useQueryClient();

    const { data, isPending } = useQuery({
        queryKey: ['todos'],
        queryFn: () => api.getTodos(),
        staleTime: Infinity,
    });

    const updateLocalTodoList = (
        id: number,
        completed: boolean,
        isSynced: boolean
    ) => {
        queryClient.setQueryData<Todo[]>(['todos'], (todoList) => {
            return todoList?.map((todo) => {
                if (todo.id === id) {
                    return { ...todo, completed, isSynced };
                }
                return todo;
            });
        });
    };

    const updateTodo = useMutation({
        mutationKey: ['todos'],
        mutationFn: async (todo: Todo) => {
            return api.updateTodo(todo);
        },
        onMutate: async (todo: Todo) => {
            await queryClient.cancelQueries({ queryKey: ['todos'] });
            updateLocalTodoList(todo.id, todo.completed, false);
        },

        onSuccess: (data, variables) => {
            updateLocalTodoList(variables.id, variables.completed, true);
        },
    });

    if (isPending) {
        return;
    }

    const handleChangeCompleted = (todo: Todo) => {
        const newCompleted = !todo.completed;
        updateLocalTodoList(todo.id, newCompleted, false);
        updateTodo.mutate({ ...todo, completed: newCompleted });
    };

    const renderItem = ({ item }: { item: Todo }) => (
        <TodoItem todo={item} onPress={handleChangeCompleted} />
    );

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}
