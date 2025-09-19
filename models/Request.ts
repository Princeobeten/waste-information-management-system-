import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IRequest extends Document {
  userId: IUser['_id'];
  serviceType: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  serviceType: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // This will automatically update the updatedAt field
});

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);
