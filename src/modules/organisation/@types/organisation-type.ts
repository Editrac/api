
export interface IOrganisation {
  name: string;
  picture: string;
  address: IAddress;
  bucketId: string;
  organisationType: OrganisationType;
  producingOrgs: string[];
  editingOrgs: string[];
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export enum OrganisationType {
  PRODUCING = 'PRODUCING',
  EDITING = 'EDITING',
}

export interface IQuestion {
  question: string,
  answerType: AnswerType,
  required: boolean,
  expectedAnswer?: string,
  options?: string[],
  errorMessage?: string,
}
export enum AnswerType {
  RADIO = "RADIO",
  TEXT = "TEXT"
}

export interface IProjectTemplate {
  name: string;
  questions: IQuestion[];
}