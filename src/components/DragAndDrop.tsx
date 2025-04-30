import "./DragAndDrop/DragAndDrop.css";
import { Image } from "react-bootstrap";
import SearchInput from "./SearchInput/SearchInput";
import useInterComSearch from "src/hooks/useInterComSearch";
import { ISelectedItem } from "../hoc/withDroppable";

export const DragAndDropComponent = ({
  handleDrop,
}: {
  handleDrop: (payload: ISelectedItem[]) => Promise<void>;
}) => {
  const { performSearch } = useInterComSearch();

  const handleSearch = (searchText: string) => {
    const searchOpts = {
      title: "Search",
      role: "",
      mode: "furtive",
      default_with_precond: true,
      precond:
        'flattenedtaxonomies:"types/VPMReference" OR flattenedtaxonomies:"types/Raw_Material" OR flattenedtaxonomies:"types/Document"',
      show_precond: false,
      multiSel: false,
      idcard_activated: false,
      select_result_max_idcard: false,
      itemViewClickHandler: "",
      search_delegation: "3dsearch",
    };

    const handleSearchResults = async (selectedObjects: any) => {
      if (
        selectedObjects &&
        selectedObjects.length > 0 &&
        selectedObjects[0].id
      ) {
        await handleDrop([
          {
            objectId: selectedObjects[0].id,
            objectType: selectedObjects[0]["ds6w:type_value"],
          },
        ]);
      } else {
        console.warn("No objectId found in selected objects");
      }
    };

    performSearch(searchText, searchOpts, handleSearchResults);
  };

  return (
    <>
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
      </div>
    </>
  );
};
