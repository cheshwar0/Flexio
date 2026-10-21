import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  fullName: string;
  team: string;
  designation: string;
  department?: string;
  cloudinaryPublicId?: string;
  imageUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    team: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or avatar is required'],
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

EmployeeSchema.index({ fullName: 'text', team: 'text', designation: 'text', department: 'text' });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
