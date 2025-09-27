import { Todo } from '@/utils/api';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
    todo: Todo;
    onPress: (todo: Todo) => void;
}

const TodoItem: React.FC<Props> = ({ todo, onPress }) => {
    return (
        <View style={styles.container}>
            <Text style={{ padding: 16 }}>{todo.title}</Text>
            <Pressable
                style={({ pressed }) => ({
                    ...styles.button,
                    opacity: pressed ? 0.7 : 1,
                })}
                onPress={() => onPress(todo)}
            >
                <Text style={styles.buttonText}>
                    {todo.completed ? 'Done' : 'Pending'}
                </Text>
            </Pressable>
        </View>
    );
};

export default TodoItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'red',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#263ac1',
        padding: 12,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
    },
});
