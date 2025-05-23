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
