// Shared fallback storage for when MongoDB is not available
// This is a temporary solution for development/testing
import bcrypt from 'bcryptjs';

interface FallbackUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  authMethod: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

const fallbackUsers: FallbackUser[] = [];

export const fallbackStorage = {
  // Add a new user
  addUser(user: FallbackUser): void {
    fallbackUsers.push(user);
    console.log(`User added to fallback storage: ${user.email}`);
  },

  // Find a user by email
  findByEmail(email: string, authMethod?: string): FallbackUser | undefined {
    return fallbackUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      (!authMethod || user.authMethod === authMethod)
    );
  },

  // Get all users (for admin functionality)
  getAllUsers(): FallbackUser[] {
    return [...fallbackUsers]; // Return a copy
  },

  // Update user (basic implementation)
  updateUser(id: string, updates: Partial<FallbackUser>): boolean {
    const index = fallbackUsers.findIndex(user => user.id === id);
    if (index >= 0) {
      fallbackUsers[index] = { ...fallbackUsers[index], ...updates };
      return true;
    }
    return false;
  },

  // Check if storage has users
  hasUsers(): boolean {
    return fallbackUsers.length > 0;
  },

  // Clear all users (for testing)
  clear(): void {
    fallbackUsers.length = 0;
  }
};

// Initialize with demo users - using runtime hash generation
let initializationPromise: Promise<void> | null = null;

async function initializeFallbackUsers() {
  if (process.env.NODE_ENV === 'development' && !fallbackStorage.hasUsers()) {
    try {
      // Generate fresh hashes at runtime
      const adminHash = await bcrypt.hash('AdminPass123!', 12);
      const userHash = await bcrypt.hash('UserPass123!', 12);
      
      fallbackStorage.addUser({
        id: 'admin_default',
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminHash,
        role: 'admin',
        authMethod: 'local',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString()
      });

      fallbackStorage.addUser({
        id: 'user_default',
        name: 'Test User',
        email: 'user@example.com',
        password: userHash,
        role: 'user',
        authMethod: 'local',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to initialize fallback users:', error);
    }
  }
}

// Export the initialization promise so other modules can await it
export function ensureInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeFallbackUsers();
  }
  return initializationPromise;
}

// Initialize users when the module is imported
ensureInitialized();
