const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// "Base de datos" en memoria
let todos = [
    { id: 1, title: 'Comprar pan', completed: false },
    { id: 2, title: 'Enviar informe al jefe', completed: true },
    { id: 3, title: 'Sacar turno médico', completed: false },
    { id: 4, title: 'Estudiar React Native', completed: false },
    { id: 5, title: 'Llamar a mamá', completed: true },
];
let idCounter = 6;

// 👉 Get all todos
app.get('/todos', (req, res) => {
    console.log('obtenemos los todos GET all');
    res.json(todos);
});

// 👉 Get one todo
app.get('/todos/:id', (req, res) => {
    const todo = todos.find((t) => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
});

// 👉 Create new todo
app.post('/todos', (req, res) => {
    const { title, completed = false } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = { id: idCounter++, title, completed };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// 👉 Update todo
app.put('/todos/:id', (req, res) => {
    console.log('update todo: ', req.params.id);
    const todo = todos.find((t) => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed } = req.body;
    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    res.json(todo);
});

// 👉 Delete todo
app.delete('/todos/:id', (req, res) => {
    const index = todos.findIndex((t) => t.id === parseInt(req.params.id));

    console.log('DELETE TODO: ', req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const deleted = todos.splice(index, 1);
    res.json(deleted[0]);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
