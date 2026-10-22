import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminUser extends Document {
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: '',
    },
    passwordHash: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
