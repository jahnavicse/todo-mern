
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  // GET: Read all todos
  const fetchTodos = async () => {
    try {
      setError('')

      const response = await fetch(API)

      if (!response.ok) {
        throw new Error('Unable to fetch todos')
      }

      const data = await response.json()
      setTodos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // POST: Create todo
  const addTodo = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Please enter a todo title')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create todo')
      }

      setTitle('')
      setMessage('Todo created successfully!')

      await fetchTodos()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // PUT: Update todo
  const updateTodo = async (id, updateData) => {
    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update todo')
      }

      setMessage('Todo updated successfully!')
      await fetchTodos()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // PUT: Toggle completion
  const toggleTodo = async (todo) => {
    await updateTodo(todo._id, {
      completed: !todo.completed,
    })
  }

  // PUT: Edit todo title
  const editTodo = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Todo title cannot be empty')
      return
    }

    const success = await updateTodo(editingId, {
      title: title.trim(),
    })

    if (success) {
      setEditingId(null)
      setTitle('')
    }
  }

  // Start editing
  const startEdit = (todo) => {
    setEditingId(todo._id)
    setTitle(todo.title)
    setError('')
    setMessage('')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setError('')
  }

  // DELETE: Delete todo
  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete todo')
      }

      setMessage('Todo deleted successfully!')
      await fetchTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'Pending') return !todo.completed
    if (filter === 'Completed') return todo.completed
    return true
  })

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">

      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">

        {/* Header */}
        <h1 className="mb-2 text-center text-3xl font-bold text-indigo-700">
          My Todo App
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Manage your daily tasks easily
        </p>

        {/* Create / Edit Form */}
        <form
          onSubmit={editingId ? editTodo : addTodo}
          className="mb-6 flex flex-wrap gap-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your task..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving
              ? 'Please wait...'
              : editingId
                ? 'Update'
                : 'Add'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-gray-200 px-4 py-3 text-gray-700"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Messages */}
        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </p>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {['All', 'Pending', 'Completed'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 ${
                filter === item
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="mb-5 flex justify-between text-sm text-gray-500">
          <span>Total: {todos.length}</span>
          <span>Pending: {todos.length - completedCount}</span>
          <span>Completed: {completedCount}</span>
        </div>

        {/* Read Todos */}
        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Loading todos...
          </p>
        ) : filteredTodos.length === 0 ? (
          <p className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
            No todos found. Add your first task!
          </p>
        ) : (
          <div className="space-y-3">

            {filteredTodos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >

                <div className="flex min-w-0 items-center gap-3">

                  {/* Completion checkbox */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    className="h-5 w-5 accent-indigo-600"
                  />

                  <span
                    className={`break-words ${
                      todo.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </span>

                </div>

                {/* Edit and Delete */}
                <div className="flex shrink-0 gap-2">

                  <button
                    type="button"
                    onClick={() => startEdit(todo)}
                    className="rounded bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTodo(todo._id)}
                    className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}

export default App
