import { useState } from "react";
import "src/components/DragAndDrop/DragAndDrop.css";
import { Image } from "react-bootstrap";
import SearchInput from "src/components/SearchInput/SearchInput";
import useInterComSearch from "src/hooks/useInterComSearch";
import { ISelectedItem } from "../hoc/withDroppable";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { setIsDropped } from "../slices/reducers/jdiBom.reducer";
import { useAppDispatch } from "../store";
import { route } from "../constants";
import ReplyIcon from "@mui/icons-material/Reply";
import { AdvancedSearch } from "./AdvancedSearch";

export const DragAndDropComponent = ({
  handleDrop = async (_: ISelectedItem[]) => [],
}: {
  handleDrop: (payload: ISelectedItem[]) => Promise<IProductInfo[]>;
}) => {
  const { performSearch } = useInterComSearch();
  const dispatch = useAppDispatch();

  const [advancedSearch, setShowAdvancedView] = useState(false);

  const handleSearch = (searchText: string) => {
    const searchOpts = {
      title: "Search",
      role: "",
      mode: "furtive",
      default_with_precond: true,
      precond:
        'flattenedtaxonomies:"types/VPMReference" OR flattenedtaxonomies:"types/Raw_Material" OR flattenedtaxonomies:"types/Document"',
      show_precond: false,
      multiSel: true,
      idcard_activated: false,
      select_result_max_idcard: false,
      itemViewClickHandler: "",
      search_delegation: "3dsearch",
    };

    const handleSearchResults = async (selectedObjects: ISelectedObject[]) => {
      if (selectedObjects?.length > 0) {
        const objectMeta = selectedObjects?.map((item) => ({
          objectId: item?.id,
          objectType: item?.["ds6w:type_value"],
        }));

        await handleDrop(objectMeta);
      } else {
        console.warn("No objectId found in selected objects");
      }
    };

    const multiSearch = searchText
      ?.trim()
      ?.split(/[\s,]+/)
      ?.filter(Boolean)
      ?.join(" OR ");

    performSearch(multiSearch, searchOpts, handleSearchResults);
  };

  const advSearchBtn = (
    <Button
      // variant={showAdvancedView ? "outlined" : "text"}
      variant={"outlined"}
      color="secondary"
      onClick={() => setShowAdvancedView((prev) => !prev)}
      sx={{ textTransform: "none", fontSize: 15 }}
    >
      {advancedSearch ? "Cancel" : "Advanced Search"}
    </Button>
  );

  return advancedSearch ? (
    <AdvancedSearch advSearchBtn={advSearchBtn} />
  ) : (
    <div className="droppable-container mt-4">
      <Image
        style={{ width: "90px", height: "90px" }}
        src="https://thewhitechamaleon.github.io/testrapp/images/drag.png"
        alt="Data Collect"
        className="search-icon"
      />
      <span className="drag-and-drop-text">Drag and Drop</span>
      <div className="divider-container">
        <hr className="divider" />
        <span className="divider-text">or</span>
        <hr className="divider" />
      </div>
      <SearchInput onSearch={handleSearch} disabled={false} />
      <Box
        sx={{
          marginTop: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={() => dispatch(setIsDropped(true))}
        >
          <ReplyIcon sx={{ fontSize: 25 }} />
        </Button>

        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={route.status}
          sx={{
            fontSize: 15,
            color: "white !important",
            textTransform: "none",
          }}
          onClick={() => dispatch(setIsDropped(true))}
        >
          Check BOM Status
        </Button>

        {advSearchBtn}
      </Box>
    </div>
  );
};

interface SnippetSegment {
  type: string;
  content: string;
  highlighted: string;
}

interface SnippetValue {
  format: string;
  name: string;
  type: string;
  text: SnippetSegment[];
  value: string;
}

type LibraryPath = string | string[];

interface ISelectedObject {
  id: string;
  resourceid: string;
  resourceid_value: string;
  "ds6w:label:snippet": string;
  "ds6w:label:snippet_value": string | SnippetValue;
  "ds6w:responsible:snippet": string;
  "ds6w:responsible:snippet_value": string | SnippetValue;
  "ds6w:cadMaster": string;
  "ds6w:cadMaster_value": string;
  implicit: string;
  implicit_value: (string | string[])[];
  "ds6w:realizedChangeAction": string;
  "ds6w:realizedChangeAction_value": string;
  "ds6w:reserved": string;
  "ds6w:reserved_value": string;
  "ds6w:policy": string;
  "ds6w:policy_value": string;
  "ds6w:responsible": string;
  "ds6w:responsible_value": string;
  "ds6w:organizationResponsible": string;
  "ds6w:organizationResponsible_value": string;
  "ds6w:isLastRevisionPerState": string;
  "ds6w:isLastRevisionPerState_value": string;
  "ds6w:isLastRevision": string;
  "ds6w:isLastRevision_value": string;
  "ds6w:kind"?: string;
  "ds6w:kind_value"?: string;
  "ds6w:type": string;
  "ds6w:type_value": string;
  "ds6w:manufacturable": string;
  "ds6w:manufacturable_value": string;
  "ds6w:created": string;
  "ds6w:created_value": string;
  "ds6w:status": string;
  "ds6w:status_value": string;
  "ds6w:libraries"?: string;
  "ds6w:libraries_value"?: LibraryPath[];
  "ds6w:deformability": string;
  "ds6w:deformability_value": string;
  "ds6w:proposedChangeAction": string;
  "ds6w:proposedChangeAction_value": string;
  "ds6w:modified": string;
  "ds6w:modified_value": string;
  "ds6w:contentStructure": string;
  "ds6w:contentStructure_value": string;
  "ds6w:project": string;
  "ds6w:project_value": string;
  "ds6w:library"?: string;
  "ds6w:library_value"?: string[];
  "ds6w:label": string;
  "ds6w:label_value": string;
  "ds6w:description"?: string;
  "ds6w:description_value"?: string;
  "ds6w:identifier": string;
  "ds6w:identifier_value": string;
  "ds6wg:revision": string;
  "ds6wg:revision_value": string;
  owner: string;
  owner_value: string;
  "ds6w:responsibleUid": string;
  "ds6w:responsibleUid_value": string;
  type_icon_url: string;
  type_icon_url_value: string;
  preview_url: string;
  preview_url_value: string;
  sourceid: string;
  sourceid_value: string;
  snippetAsStringArray: any[];
  actions: any[];
}
