// api.ts
export type Todo = {
    id: number;
    title: string;
    completed: boolean;
    isSynced?: boolean;
};

export const api = {
    getTodos: async (): Promise<Todo[]> => {
        const response = await fetch('http://192.168.101.9:4000/todos');
        if (!response.ok) {
            throw new Error('Error fetching todos');
        }
        return response.json();
    },

    createTodo: async (todo: Todo): Promise<Todo> => {
        const response = await fetch('http://192.168.101.9:4000/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo),
        });
        if (!response.ok) {
            throw new Error('Error creating todo');
        }
        return response.json();
    },

    deleteTodo: async (todo: Todo): Promise<void> => {
        const response = await fetch(
            `http://192.168.101.9:4000/todos/${todo.id}`,
            {
                method: 'DELETE',
            }
        );
        if (!response.ok) {
            throw new Error('Error deleting todo');
        }
    },

    updateTodo: async (todo: Todo): Promise<Todo> => {
        const response = await fetch(
            `http://192.168.101.9:4000/todos/${todo.id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todo),
            }
        );
        if (!response.ok) {
            throw new Error('Error updating todo');
        }
        return response.json();
    },
};
