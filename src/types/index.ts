export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user"
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  assignedTo?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  status: "active" | "inactive" | "completed"
  members: User[]
  tasks: Task[]
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface LoginProps {
  email: string,
  pass: string
}