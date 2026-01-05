import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  authMethod: 'local' | 'ldap' | 'oauth';
  provider?: string;
  providerId?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<this>;
  resetLoginAttempts(): Promise<this>;
  isLocked: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return this.authMethod === 'local';
    },
    minlength: [8, 'Password must be at least 8 characters long']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  authMethod: {
    type: String,
    enum: ['local', 'ldap', 'oauth'],
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'github', 'ldap'],
    required: function(this: IUser) {
      return this.authMethod === 'oauth' || this.authMethod === 'ldap';
    }
  },
  providerId: {
    type: String,
    required: function(this: IUser) {
      return this.authMethod === 'oauth';
    }
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ authMethod: 1 });
userSchema.index({ providerId: 1, provider: 1 });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Note: Password hashing is handled manually in the registration route
// to avoid Mongoose middleware compatibility issues

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
