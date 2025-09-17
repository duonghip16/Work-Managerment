// Mock database - in production, use a real database
export interface MockUser {
  id: string
  email: string
  name: string
  password: string
  role: 'admin' | 'user'
  emailVerified: boolean
  createdAt: Date
}

// Global mock database
const users: MockUser[] = []

export const mockDB = {
  users: {
    create: (user: MockUser) => {
      users.push(user)
      return user
    },
    findByEmail: (email: string) => {
      return users.find(user => user.email === email)
    },
    findById: (id: string) => {
      return users.find(user => user.id === id)
    },
    updateEmailVerified: (email: string, verified: boolean) => {
      const user = users.find(user => user.email === email)
      if (user) {
        user.emailVerified = verified
      }
      return user
    },
    getAll: () => users
  }
}