export const jdiBom: IinitialState["jdiBom"] = {
  initialDraggedData: [],

  objectIds: [],
  objectDetails: [],

  isDropped: true,
  isLoading: false,
};

export const initialState: IinitialState = {
  jdiBom,
  user: {
    id: "",
    userId: "",
    userName: "",
    name: "",
    email: "",
    is_authorized: "",
    userinfo: [],
    updated_at: "",
    created_at: "",
    _rid: "",
    _self: "",
    _etag: "",
    _attachments: "",
    _ts: null,
  },
};
