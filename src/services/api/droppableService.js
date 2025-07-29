import { env } from "src/app/jdiBom/env";
import { callwebService } from "../../utils/helpers";

// 1. Export a global variable to hold the collabSpaceTitle
export let globalCollabSpaceTitles = [];
export let globalCollabSpaceNames = []; // New global variable for names

// 2. Create a function to process and store the collabSpaceTitle and CollabSpaceName
export function processCollabSpace(collabspace) {
  if (!collabspace || !collabspace.title) {
    console.warn("[droppableService]  No collabspace found.");
    return;
  }
  // Extract and trim the title from the collabspace object
  const collabSpaceTitle = collabspace.title.trim();
  const collabSpaceName = collabspace.name.trim(); // Extract the name

  // console.log("[droppableService] collabSpaceTitle:", collabSpaceTitle);
  // console.log("[droppableService] collabSpaceName:", collabSpaceName); // Log the name

  if (!Array.isArray(globalCollabSpaceTitles)) {
    globalCollabSpaceTitles = []; // Reset if somehow changed to a string
  }
  // Store multiple collabSpaceTitles in an array
  if (!globalCollabSpaceTitles.includes(collabSpaceTitle)) {
    globalCollabSpaceTitles.push(collabSpaceTitle);
  }

  // Same logic for names
  if (!Array.isArray(globalCollabSpaceNames)) {
    globalCollabSpaceNames = []; // Reset if somehow changed to a string
  }
  // Store multiple collabSpaceNames in an array
  if (!globalCollabSpaceNames.includes(collabSpaceName)) {
    globalCollabSpaceNames.push(collabSpaceName);
  }

  // console.log("[droppableService] Updated collabSpaceTitles array:", globalCollabSpaceTitles);
  // console.log("[droppableService] Updated collabSpaceNames array:", globalCollabSpaceNames);
}

export const SecurityContext = async () => {
  const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;
  let email = "";

  let securitycontextpreference = {
    name: "Credentials",
    type: "list",
    label: "Credentials",
    options: [],
    defaultValue: "",
  };

  let urlObjWAF = `${env.ENOVIA_URL}/resources/modeler/pno/person?current=true&select=collabspaces&select=preferredcredentials&select=email`;
  let response = await callwebService("GET", urlObjWAF, "");

  console.log("Response for Preferences:", response);
  if (response.status) {
    if (response.output.collabspaces) {
      response.output.collabspaces.forEach((collabspace) => {
        let collabSpaceName = collabspace.name.trim(); // title
        let collabSpaceTitle = collabspace.title.trim(); // title
        // globalCollabSpaceTitles = collabSpaceTitle;
        processCollabSpace(collabspace);
        console.log("collab start", collabSpaceTitle);
        let couples = collabspace.couples;
        couples.forEach((couple) => {
          //MSOL-Micro Motion ● Measurement Solutions ● Leader
          const SecurityContextStr =
            couple.role.name +
            "." +
            couple.organization.name +
            "." +
            collabSpaceName;
          const SecurityContextLbl =
            collabSpaceTitle +
            " ● " +
            couple.organization.title +
            " ● " +
            couple.role.nls;
          securitycontextpreference.options.push({
            value: SecurityContextStr,
            label: SecurityContextLbl,
          });
        });
      });
    }
    if (response.output.preferredcredentials) {
      const preferredCredentials = response.output.preferredcredentials;
      const defaultOption = `${preferredCredentials.role.name}.${preferredCredentials.organization.name}.${preferredCredentials.collabspace.name}`;
      securitycontextpreference.defaultValue = defaultOption;
    }
    if (response.output.email) {
      email = response.output.email;
    }
  }

  return { securitycontextpreference: securitycontextpreference, email: email };
};
