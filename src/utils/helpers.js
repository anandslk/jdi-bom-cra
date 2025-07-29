import axios from "axios";

export const loadWAFData = async () => {
  return await new Promise((resolve, reject) => {
    window.require(
      ["DS/WAFData/WAFData"],
      (module) => {
        resolve(module);
      },
      reject,
    );
  });
};

export const loadInterCom = async () => {
  return await new Promise((resolve, reject) => {
    window.require(
      ["UWA/Utils/InterCom"],
      (InterCom) => {
        // console.log("InterCom module loaded:", InterCom); // Log the loaded module
        resolve(InterCom);
      },
      (error) => {
        console.error("Error loading InterCom module:", error);
        reject(error);
      },
    );
  });
};

export const callwebService = async (method, url, body) => {
  let returnobj = {};
  const WAFData = await loadWAFData();
  let dataResp = WAFData.authenticatedRequest(url, {
    method: method,
    data: body,
    type: "json",
    async: false,
    onComplete: function (dataResp) {
      returnobj.status = true;
      returnobj.output = dataResp;
      console.log("kp--CallWebService--- >> ", dataResp);
    },
    onFailure: function (error, backendresponse, response_hdrs) {
      console.log("Failedddddd", error.message);
      returnobj.status = false;
      console.log(response_hdrs);
      widget.body.innerHTML += "<p>Something Went Wrong" + error + "</p>";
    },
  });

  return returnobj;
};
