export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    PROFILE: "/api/auth/profile",
  },
  TASKS: {
    LIST: "/api/tasks",
    CREATE: "/api/tasks",
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
  USERS: {
    LIST: "/api/users",
    PROFILE: (id: string) => `/api/users/${id}`,
  },
} as const

export const APP_CONFIG = {
  APP_NAME: "TwoRegistro",
  VERSION: "1.0.0",
  DESCRIPTION: "Aplicación de gestión de tareas",
} as const

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/profile",
  TASKS: "/tasks",
} as const