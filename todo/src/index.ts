import express from "express";

export const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({message:"hey shubham, welcome"})
})

type todoType = {
  id: number;
  task: string;
  completed: string;
}

const todos: todoType[] = [];
let nextId = 1;

// GET all todos
app.get("/todos", (_, res) => {
  res.json(todos);
})

// GET a specific todo 
app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const todo = todos.find(t => t.id === id)

  if(todo){
    res.status(201).json(todo);
    return;
  } else {
    res.status(404).json({message: "todo not found"});
  }
});

// update a todo 
app.post("/todos/:id", (req, res) => {
  
  const id = parseInt(req.body.id);
  const {task, completed} = req.body;
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex > -1) {
    todos[todoIndex] = {...todos[todoIndex], task, completed}
    res.status(201).json(todos[todoIndex]);
    return;
  } else{
    res.status(201).json({error: "todo not found"});
  }
})

app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t =>  t.id === id);
  if (todoIndex > -1) {
    todos.splice(todoIndex, 1);
    res.status(201).send();
    return;
  } else {
    res.status(404).json({error: "no such todo found"})
  }
})

app.post("/todos", (req, res) => {
  const {task, completed} = req.body;
  
  if (!task ) {
    res.status(400).json({error: "Invalid Inputs"})
  }

  const newTodo = {
    id: nextId++, 
    task, 
    completed: completed || false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
})
