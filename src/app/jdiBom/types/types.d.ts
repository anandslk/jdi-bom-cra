export {};

declare global {
  interface IProductInfo {
    Title: string;
    Type: string;
    "Maturity State": string;
    Owner: string;
    "Collaborative Space": string;
    "Collaborative Space Title": string;
    Description: string;
    "Dropped Revision": string;
    "Dropped Revision ID": string;
    "Latest Released Revision": string;
    "Latest Released Revision ID": string;
    EIN: string;
    "CAD Format": string;
    imageURL: string;
    relativePath: string;
    Name: string;
    organization: string;
    "Latest Revision": string;
    MFGCA: boolean;
  }

  interface IObjectId {
    objectType: string;
    objectId: string;
  }

  interface IJdiBom {
    initialDraggedData: {
      envId?: string;
      serviceId?: string;
      contextId?: string;
      objectId: string;
      objectType: string;
      displayName?: string;
      i3dx?: string;
      displayType?: string;
    }[];

    objectIds: IObjectId[];
    objectDetails: IProductInfo[];
    isDropped: boolean;
  }

  interface IinitialState {
    jdiBom: IJdiBom;
  }
}
