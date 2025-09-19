import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
    // removed unique:true to avoid duplicate index
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// This ensures the email is case insensitive for unique constraint
UserSchema.index({ email: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
