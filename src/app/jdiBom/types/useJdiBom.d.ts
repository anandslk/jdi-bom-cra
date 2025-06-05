interface Ancestor {
  identifier: string;
  relativePath: string;
  edgeType: string;
  id: string;
  source: string;
  type: string;
}

interface EngItemVersion {
  identifier: string;
  maturityState: string;
  relativePath: string;
  id: string;
  source: string;
  type: string;
  revision: string;
  ancestors?: Ancestor[];
}

interface EngItemResult {
  identifier: string;
  versions: EngItemVersion[];
  relativePath: string;
  id: string;
  source: string;
  type: string;
}

interface EngItemResponse {
  results: EngItemResult[];
}

// ***************************************

interface Role {
  pid: string;
  name: string;
  nls: string;
}

interface Organization {
  pid: string;
  name: string;
  title: string;
}

interface Couple {
  organization: Organization;
  role: Role;
}

interface Collabspace {
  pid: string;
  name: string;
  title: string;
  couples: Couple[];
}

interface UserCollabspaces {
  pid: string;
  name: string;
  email: string;
  collabspaces: Collabspace[];
}

// ***************************************

// One attribute within ClassificationAttributes
interface ClassificationAttribute {
  name: string;
  value: string | boolean;
}

// One classification group
interface ClassificationMember {
  ClassID: string;
  Attributes: ClassificationAttribute[];
}

// The structure inside .member[0].ClassificationAttributes
interface ClassificationAttributes {
  totalItems: number;
  member: ClassificationMember[];
}

// The main product structure in .member[]
interface ProductMember {
  id: string;
  name: string;
  ClassificationAttributes: ClassificationAttributes;
  cestamp: string;
}

// The API response from the fetch
interface ClassifiedItemResponse {
  totalItems: number;
  member: ProductMember[];
  nlsLabel: {
    id: string;
    name: string;
    title: string;
    libraryUsage: string;
    classUsage: string;
  };
}
