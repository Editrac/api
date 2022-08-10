import mongoose from "mongoose";
import { IProject, IProjectTask } from '../@types/project-type';
import { ProjectTaskStatus } from '../@types/project-type';

export type ProjectTaskDocument = mongoose.Document & IProjectTask

const projectTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  videos: [{
    name: {
      type: String,
      required: true
    },
    file: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    quality: String,
    codecName: String,
    width: Number,
    height: Number,
    duration: Number,
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'VideoComment'
      }
    ]
  }],
  editor: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    default: ProjectTaskStatus.IN_PROGRESS,
    enum: Object.values(ProjectTaskStatus)
  },
  project: {
    type: mongoose.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  producingOrg: {
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  editingOrg: {
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  }
}, { timestamps: true });

export const ProjectTask = mongoose.model<ProjectTaskDocument>("ProjectTask", projectTaskSchema);
export default ProjectTask;