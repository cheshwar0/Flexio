import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyPerformance extends Document {
  weekId: string;
  title: string;
  presentedBy?: string;
  weekStartDate: Date;
  weekEndDate: Date;
  status: 'draft' | 'published';
  isCurrent: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyPerformanceSchema = new Schema<IWeeklyPerformance>(
  {
    weekId: {
      type: String,
      required: [true, 'Week ID is required (e.g. 2026-W42)'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Week title is required'],
      trim: true,
    },
    presentedBy: {
      type: String,
      default: 'Alpha Team',
      trim: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: 'HR Admin',
    },
  },
  {
    timestamps: true,
  }
);

WeeklyPerformanceSchema.index({ isCurrent: 1, status: 1 });

export const WeeklyPerformance = mongoose.model<IWeeklyPerformance>(
  'WeeklyPerformance',
  WeeklyPerformanceSchema
);
