import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IRequest } from './Request';

export interface INotification extends Document {
  userId: IUser['_id'];
  requestId?: IRequest['_id'];
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requestId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Request' 
  },
  message: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
