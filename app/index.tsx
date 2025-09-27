import TodoItem from '@/components/TodoItem';
import { useOfflineEntity } from '@/hooks/useOfflineEntity';
import { api, Todo } from '@/utils/api';
import { FlatList, View } from 'react-native';

export default function Index() {
    const { data, isPending, updateEntity, deleteEntity, createEntity } =
        useOfflineEntity<Todo>({
            queryKey: ['todos'],
            fetchFn: api.getTodos,
            createFn: api.createTodo,
            updateFn: api.updateTodo,
            deleteFn: api.deleteTodo,
            idKey: 'id',
        });

    if (isPending) return null;

    const handleChangeCompleted = (todo: Todo) => {
        updateEntity({ ...todo, completed: !todo.completed });
    };

    return (
        <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TodoItem
                        todo={item}
                        onPress={() => handleChangeCompleted(item)}
                        onLongPress={() => deleteEntity(item)}
                    />
                )}
            />
        </View>
    );
}
