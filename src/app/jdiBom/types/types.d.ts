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
    HasMBOM: boolean;
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
    isLoading: boolean;
  }

  interface IUser {
    id: string;
    userId: string;
    userName: string;
    name: string;
    email: string;
    is_authorized: "Y" | "N" | "";
    email_verified: boolean | null;
    userinfo: ("admin" | "Everyone" | "Guest")[];
    updated_at: string;
    created_at: string;
    _rid: string;
    _self: string;
    _etag: string;
    _attachments: string;
    _ts: number | null;
  }

  interface IinitialState {
    jdiBom: IJdiBom;
    user: IUser;
  }
}
