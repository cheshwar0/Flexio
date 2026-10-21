import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyRanking extends Document {
  weekId: string;
  employeeId: string;
  rank: number;
  performanceScore: number;
  achievementDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyRankingSchema = new Schema<IWeeklyRanking>(
  {
    weekId: {
      type: String,
      required: [true, 'Week ID is required'],
      index: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
      trim: true,
    },
    rank: {
      type: Number,
      required: [true, 'Rank is required'],
      min: 1,
      max: 10,
    },
    performanceScore: {
      type: Number,
      required: [true, 'Performance score is required'],
      min: 0,
      max: 1000,
    },
    achievementDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness within a week
WeeklyRankingSchema.index({ weekId: 1, employeeId: 1 }, { unique: true });
WeeklyRankingSchema.index({ weekId: 1, rank: 1 });

export const WeeklyRanking = mongoose.model<IWeeklyRanking>(
  'WeeklyRanking',
  WeeklyRankingSchema
);
