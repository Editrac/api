
export interface IVideoComment {
  text: string;
  visibility: string;
  video: string;
  user: string;
  timestamp: number;
}

export enum VideoCommentVisibility {
  EVERYONE = 'EVERYONE',
  TEAM = 'TEAM'
}