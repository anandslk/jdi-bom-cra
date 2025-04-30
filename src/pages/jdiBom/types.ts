export interface IMfg {
  totalItems: number;
  member: {
    source: string;
    identifier: string;
    relativePath: string;
    type: string;
    id: string;
    relationType: string;
  }[];
}

export interface IDetail extends IMfg {
  detail: {
    totalItems: number;
    member: {
      name: string;
      title: string;
      description: string;
      id: string;
      type: string;
      modified: string;
      created: string;
      revision: string;
      state: string;
      owner: string;
      organization: string;
      collabspace: string;
      cestamp: string;
    }[];

    nlsLabel: {
      id: string;
      type: string;
      modified: string;
      created: string;
      revision: string;
      state: string;
      owner: string;
    };
  };
}

export type IEnrichedMember = IMfg["member"][0] & {
  detail: IDetail["detail"];
};
