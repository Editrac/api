import mongoose from "mongoose";
import { IProjectTemplate, AnswerType } from '../@types/organisation-type';

export type ProjectTemplateDocument = mongoose.Document & IProjectTemplate

const projectTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  questions: [
    {
      _id: false,
      answerType: {
        type: String,
        enum: Object.values(AnswerType)
      },
      question: String,
      required: Boolean,
      expectedAnswer: String,
      options: [],
      errorMessage: String,
    }
  ],
  organisation: {
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
}, { timestamps: true });

export const ProjectTemplate = mongoose.model<ProjectTemplateDocument>("ProjectTemplate", projectTemplateSchema);
