import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  teamId: string; // Unique team ID e.g. TEAM-01
  slotNumber: number; // 1 to 8
  name: string;
  description?: string;
  teamLeaderEmployeeId?: string | null; // References Employee.employeeId
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    teamId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    slotNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 8,
    },
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    teamLeaderEmployeeId: {
      type: String,
      default: null,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ name: 1 });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);


