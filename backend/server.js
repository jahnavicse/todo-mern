
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import todoRoutes from './routes/todoRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Todo API is running successfully')
})

app.use('/api/todos', todoRoutes)

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
      console.log(`Todo API: http://localhost:${PORT}/api/todos`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
