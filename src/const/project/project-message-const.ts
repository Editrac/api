import { AnswerType, IProjectTemplate } from '../../modules/organisation/@types/organisation-type';

export const CREATE_PROJECT_SUCCESSFULL = 'Project created successfully';

export const CREATE_PROJECT_TASK_SUCCESSFULL = 'Task created successfully';

export const PROJECT_NOT_FOUND = 'Project not found';

export const PROJECT_TASK_NOT_FOUND = 'Task not found';

export const UPDATE_PROJECT_SUCCESSFULL = 'Project updated successfully';

export const UPDATE_PROJECT_TASK_SUCCESSFULL = 'Task updated successfully';

export const ADD_MANAGER_TO_PROJECT_SUCCESSFULL = 'Manager added to project successfully';

export const ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL = 'Editor added to task successfully';

export const UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL = 'Task status updated successfully';


export const DEFAULT_PROJECT_TEMPLATE: IProjectTemplate = {
  name: 'Default',
  questions: [
    {
      question: "Raw file URL",
      answerType: AnswerType.TEXT,
      required: true,
      expectedAnswer: "",
      options: [],
      errorMessage: "Raw file URL is required."
    },
    {
      question: "Description",
      answerType: AnswerType.TEXT,
      required: true,
      expectedAnswer: "",
      options: [],
      errorMessage: "Description is required."
    }]
}