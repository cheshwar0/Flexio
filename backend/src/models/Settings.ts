import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  companyName: string;
  companyLogoUrl: string;
  presentedBy: string;
  motivationalMessage: string;
  carouselIntervalSeconds: number;
  dataRefreshIntervalSeconds: number;
  teamLeaderSlideDurationSeconds: number;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    companyName: {
      type: String,
      default: 'FLEXIO',
      trim: true,
    },
    companyLogoUrl: {
      type: String,
      default: '/flexio-logo.png',
      trim: true,
    },
    presentedBy: {
      type: String,
      default: 'Alpha Team',
      trim: true,
    },
    motivationalMessage: {
      type: String,
      default: 'EXCELLENCE DESERVES RECOGNITION',
      trim: true,
    },
    carouselIntervalSeconds: {
      type: Number,
      default: 5,
      min: 3,
      max: 60,
    },
    dataRefreshIntervalSeconds: {
      type: Number,
      default: 60,
      min: 10,
      max: 600,
    },
    teamLeaderSlideDurationSeconds: {
      type: Number,
      default: 5,
      min: 3,
      max: 60,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
