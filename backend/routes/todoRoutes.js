
import express from 'express'
import mongoose from 'mongoose'
import Todo from '../models/Todo.js'

const router = express.Router()

// GET: Read all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 })
    res.status(200).json(todos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST: Create a todo
router.post('/', async (req, res) => {
  try {
    const { title } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Todo title is required',
      })
    }

    const todo = await Todo.create({
      title: title.trim(),
    })

    res.status(201).json(todo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT: Update a todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid todo ID',
      })
    }

    const { title, completed } = req.body

    if (
      title === undefined &&
      completed === undefined
    ) {
      return res.status(400).json({
        message: 'Provide title or completed status',
      })
    }

    const updateData = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Todo title cannot be empty',
        })
      }

      updateData.title = title.trim()
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          message: 'Completed must be true or false',
        })
      }

      updateData.completed = completed
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found',
      })
    }

    res.status(200).json(todo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE: Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid todo ID',
      })
    }

    const todo = await Todo.findByIdAndDelete(id)

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found',
      })
    }

    res.status(200).json({
      message: 'Todo deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
