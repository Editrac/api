export interface IProject {
  description: string;
  name: string;
  manager: string;
  editors: string[];
  organisation: string;
  tasks: string[];
}
export interface IProjectTask {
  description: string;
  status: ProjectTaskStatus;
  name: string;
  editor: string;
  organisation: string;
  project: string;
  videos: IProjectVideo[];
}

export interface IProjectVideo {
  file: string;
  version: number;
  uploadedAt: string;
  user: string;
}


export enum ProjectTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  REVISION = 'REVISION',
  COMPLETED = 'COMPLETED'
}