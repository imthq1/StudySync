export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string
}

export interface User {
  id: number
  email: string
  name: string
}

export interface LoginResult {
  access_token: string
  refresh_token: string
  user: User
}

export interface ApiResponse<T> {
  data: T
  error: unknown
  message: string
  statusCode: number
}
