export interface IProductInfo {
  Title: string;
  Type: string;
  MaturityState: string;
  Owner: string;
  CollaborativeSpace: string;
  CollaborativeSpaceTitle: string;
  Description: string;
  DroppedRevision: string;
  DroppedRevisionID: string;
  LatestReleasedRevision: string;
  LatestReleasedRevisionID: string;
  EIN: string;
  CADFormat: string;
  imageURL: string;
  relativePath: string;
  Name: string;
  organization: string;
  LatestRevision: string;
  MFGCA: boolean;
}

export interface IObjectId {
  objectType: string;
  objectId: string;
}

export const initialState = {
  user: {
    fullName: "",
    email: "",
    role: "",
    token: "",
  },
};
