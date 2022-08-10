import mongoose from "mongoose";
import { IProject } from '../@types/project-type';

export type ProjectDocument = mongoose.Document & IProject

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  questions: [{
    question: String,
    answerType: String,
    answer: String
  }],
  tasks: [{
    type: mongoose.Types.ObjectId,
    ref: 'ProjectTask'
  }],
  manager: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  editors: [{
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }],
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

export const Project = mongoose.model<ProjectDocument>("Project", projectSchema);
export default Project;