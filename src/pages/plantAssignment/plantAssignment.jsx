import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardComponent from "../../components/Card/Card";
import { Image } from "react-bootstrap";
import "./plantAssignment.css";
import Loader from "../../components/Loader/Loader";
import ReusableTable from "../../components/Table/Table";
import CardWithDragAndDrop from "../../components/Card/cardwithdraganddrop";
import { FaRegCopy } from "react-icons/fa";
import {
  setDroppedObjectData,
  setIsDropped,
  setPlantObjectData,
} from "../../store/droppedObjectSlice";
import {
  formattedFinalMessage,
  getCardData,
  getTableData,
  getUniqueTableData,
  processErrorObj,
  tableColumns,
  uniqueColumns,
} from "./dataHelpers";
import useToast from "../../hooks/useToast";
// import { MSG_WIDGET_RESET_SUCCESS } from "../../utils/toastMessages";
import usePlantDropableArea from "../../hooks/usePlantDropableArea";
import { saveData } from "../../services/api/PlantAssignment/saveTableDataService";
import PlantAssignmentToolbarNativeCta from "./plantAssignmentToolbarNativeCta";
import { MSG_SAVE_FAILURE, MSG_SAVE_SUCCESS } from "../../utils/toastMessages";
import { clearAllListeners } from "@reduxjs/toolkit";
import { faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import DragAndDropComponent from "./DragAndDrop";

const PlantAssignment = () => {
  const { initializeDroppableArea, loading } = usePlantDropableArea();
  const [tableKey, setTableKey] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [assignedPlant, setAssignedPlant] = useState([]);
  const [uniqueData, setUniqueData] = useState([]);
  // const [addedItem, setAddedItem] = useState([]);
  const [addedDataFromToolbar, setAddedDataFromToolbar] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [screenLoader, setScreenLoader] = useState(false);
  const [isCardDataAvailable, setIsCardDataAvailable] = useState(false);
  const dispatch = useDispatch();
  const { showSuccessToast, showErrorToast } = useToast();

  const handleSave = async () => {
    console.log("OnSave is Called with the TableData", tableData);
    // Pass the current tableData to the onSave function

    setScreenLoader(true);
    await onSave(tableData); // Pass tableData when calling onSave
  };
  const handleRemove = async () => {
    console.log("Selected Table Rows:", selectedTableRows);
    console.log("handleRemove is Called with the TableData", tableData);

    if (selectedTableRows.length > 0) {
      // Extract IDs or titles of selected rows
      const selectedTitles = selectedTableRows.map((row) => row.Plant);
      console.log("Selected Titles:", selectedTitles);

      // // Filter out selected rows from assignedPlant and update tableData
      // const updatedAssignedPlant = assignedPlant.filter(
      //   (row) => !selectedTitles.includes(row.title)
      // );
      // console.log("Updated Assigned Plant:", updatedAssignedPlant);

      // Extract filtered-out rows to add them back to uniqueData
      // const removedPlants = assignedPlant.filter((row) =>
      //   selectedTitles.includes(row.title)
      // );
      const removedTitles = selectedTitles.map((title) => ({
        title: title,
      }));
      console.log("Removed Titles:", removedTitles);
      const updatedTableData = tableData.filter(
        (row) => !selectedTitles.includes(row.Plant)
      );
      console.log("updateTableData", updateTableData);
      if (updateTableData) {
        setTableData(updatedTableData);
        setTableKey((prevKey) => prevKey + 1); // Update table key
      }

      // // Update state
      // // setAssignedPlant(updatedAssignedPlant); // Updated tableData
      setUniqueData((prevUniquePlants) => [
        ...prevUniquePlants,
        ...removedTitles,
      ]); // Add removed items back to uniqueData
    } else {
      alert("Please select at least one row to remove.");
    }
  };

  const handleAdded = (data) => {
    console.log("Data Received");
    setAddedDataFromToolbar(data);
    console.log("[Plant Assignment] Table data", tableData);
    console.log("Added Data from Toolbar", data);
    setTableData((prev) => [
      ...data.map(({ title, ...rest }) => ({ Plant: title, ...rest })),
      ...prev,
    ]);
    setTableKey((prevKey) => prevKey + 1); // Update table key
  };
  const handleUnique = (data) => {
    console.log("The data received from Child is:", data);
    const updatedTableData = uniqueTableData.filter(
      (row) =>
        !data.find((selectedRow) => selectedRow === row["Available Plant"])
    );
    console.log("Updated Table Data after unique:", updatedTableData);
    if (updatedTableData) {
      const transformedData = updatedTableData.map((item) => ({
        title: item["Available Plant"],
      }));

      console.log(transformedData);
      setUniqueData(transformedData);
    }
  };

  console.log("Table Data after Adding:", tableData);
  const selectedTableRows = useSelector(
    (state) => state.droppedObject.selectedTableRows
  );
  // Access Redux store
  const droppedObjectData = useSelector(
    (state) => state.droppedObject.droppedObjectData
  );
  console.log("droppedObjectData", droppedObjectData);

  const loadingParentDetails = useSelector(
    (state) => state.droppedObject.loadingParentDetails
  );
  console.log("Parents Loading State:", loadingParentDetails);
  const proposedChanges = useSelector(
    (state) => state.droppedObject.plantObjectData.proposedChanges
  );
  console.log("Proposed Changes are:", proposedChanges);

  const isDropped = useSelector((state) => state.droppedObject.isDropped);

  const allPlants = useSelector(
    (state) => state.droppedObject.plantObjectData.allPlants
  );
  console.log("[PlantAssignment] plant object data: ", allPlants);

  const uniquePlant = useSelector(
    (state) => state.droppedObject.plantObjectData.uniquePlants
  );
  console.log("[Plant Assignment] Unique Plants:", uniquePlant);
  useEffect(() => {
    setUniqueData(uniquePlant);
  }, [uniquePlant]);
  const asignedPlant = useSelector(
    (state) => state.droppedObject.plantObjectData.initialAssignedPlants
  );
  console.log("The Assigned Plants are:", asignedPlant);
  const productChildren = useSelector(
    (state) => state.droppedObject.plantObjectData.productChildren
  );
  console.log("[Plant Assignment] Product Children:", productChildren);
  const CAName = useSelector(
    (state) => state.droppedObject.plantObjectData.CAName
  );
  console.log("[plant Assignment] CAName:", CAName);

  const headers = useSelector(
    (state) => state.droppedObject.plantObjectData.headers
  );
  console.log("[Plant Assignment] Headers are: ", headers);

  // Updated: Function to update table data when dropdown changes
  const updateTableData = (updatedData) => {
    setTableData(updatedData);
  };

  console.log("Tanble Data is:", tableData);
  // Trigger re-render of ReusableTable by changing the key
  useEffect(() => {
    if (tableData.length >= 0) {
      setTableKey((prevKey) => prevKey + 1); // Increment the key to trigger a re-render
    }
  }, [tableData]); // Runs whenever tableData changes
  if (droppedObjectData.cardData && droppedObjectData.initialDraggedData) {
    var state = droppedObjectData.cardData["Maturity State"];
    var type = droppedObjectData.initialDraggedData.objectType;
  }

  const [dupInitialAssignedClasses, setDupInitialAssignedClasses] =
    useState(asignedPlant);
  console.log(
    "Duplicate Initial Assigned Classes are:",
    dupInitialAssignedClasses
  );
  useEffect(() => {
    setDupInitialAssignedClasses(asignedPlant);
    setAssignedPlant(asignedPlant);
  }, [asignedPlant]);
  const onSave = async (tableData) => {
    let updatedItems = {};
    // let DupInitialAssignedClasses = [...asignedPlant]; // Clone the initial array to avoid direct mutation
    const classesToBeClassified = [];

    console.log("Table Data", tableData);
    console.log("Before DupInitialAssignedClasses:", dupInitialAssignedClasses);
    let finalArray = [];
    // Create a new array with updated classes instead of mutating
    let updatedAssignedClasses = dupInitialAssignedClasses.map((intclass) => {
      let updatedClass = { ...intclass }; // Shallow clone to avoid modifying the original object

      tableData.forEach((tableItem) => {
        let finalObj = {};
        const plantName = tableItem.Plant.replace("Plant", "").replace(
          /\s+/g,
          ""
        );

        const classid = allPlants.find(
          (classitem) => classitem.title === tableItem.Plant
        )?.id;

        if (updatedClass.title === tableItem.Plant) {
          const MBOMValue = updatedClass.MBOM ? "Make" : "Buy";

          // Update only if MBOMValue has changed
          if (MBOMValue !== tableItem.MBom) {
            if (/^\d/.test(plantName)) {
              updatedItems[`MBOM${plantName}`] = tableItem.MBom === "Make";
              finalObj.MBOMName = `MBOM${plantName}`;
              finalObj.MBOMValue = tableItem.MBom === "Make";
            } else {
              updatedItems[`${plantName}MBOM`] = tableItem.MBom === "Make";
              finalObj.MBOMName = `${plantName}MBOM`;
              finalObj.MBOMValue = tableItem.MBom === "Make";
            }
            updatedClass.MBOM = tableItem.MBom === "Make"; // Modify the cloned object
            finalObj = {
              ...finalObj,
              id: classid,
              title: tableItem.Plant,
              Type: "Update",
            };
            finalArray.push(finalObj);
          }
        }
      });
      return updatedClass; // Return updated or unchanged class object
    });

    // Find additional rows to classify
    tableData.forEach((tableItem) => {
      const matchedClass = dupInitialAssignedClasses.find(
        (initialClass) => initialClass.title === tableItem.Plant
      );

      if (!matchedClass) {
        const plantName = tableItem.Plant.replace("Plant", "").replace(
          /\s+/g,
          ""
        );
        const classid = allPlants.find(
          (classitem) => classitem.title === tableItem.Plant
        )?.id;

        if (classid) {
          let classObject = { id: classid, title: tableItem.Plant };
          let finalObj = {};
          classesToBeClassified.push(classid);

          if (tableItem.MBom === "Make") {
            if (/^\d/.test(plantName)) {
              updatedItems[`MBOM${plantName}`] = true;
              finalObj.MBOMName = `MBOM${plantName}`;
            } else {
              updatedItems[`${plantName}MBOM`] = true;
              finalObj.MBOMName = `${plantName}MBOM`;
            }
            classObject.MBOM = true;
            finalObj.MBOMValue = true;
          } else {
            classObject.MBOM = false;
            finalObj.MBOMValue = false;
          }

          updatedAssignedClasses.push(classObject);
          finalObj = {
            ...finalObj,
            id: classid,
            title: tableItem.Plant,
            Type: "New",
          };
          finalArray.push(finalObj);
        }
      }
    });
    //---------------
    let rowstoDelete = [];
    dupInitialAssignedClasses.forEach((initialClass) => {
      const isNotInTableData = !tableData.some(
        (tableItem) => tableItem.Plant === initialClass.title
      );
      if (isNotInTableData) {
        const classid = allPlants.find(
          (classItem) => classItem.title === initialClass.title
        )?.id;
        if (classid) {
          rowstoDelete.push(classid);
        }
      }
    });

    updatedAssignedClasses = updatedAssignedClasses.filter(
      (classItem) => !rowstoDelete.includes(classItem.id)
    );

    console.log("Rows getting deleted rowstoDelete:", rowstoDelete);
    //Need to pass this is savetable function
    //---------------

    console.log("After DupInitialAssignedClasses:", updatedAssignedClasses);
    console.log("Classes to be Classified:", classesToBeClassified);
    console.log("Updated Items:", updatedItems);
    console.log();

    // Call services with updated data
    const result = await saveData(
      updatedItems,
      classesToBeClassified,
      updatedAssignedClasses,
      headers,
      droppedObjectData.initialDraggedData?.data?.items[0].objectId,
      allPlants,
      productChildren,
      type,
      rowstoDelete,
      finalArray,
      proposedChanges
    );

    if (result.success) {
      setScreenLoader(false);
      console.log("Save result:", result);
      if (result.Finalmessage === "" || result.Finalmessage == null) {
        showSuccessToast(MSG_SAVE_SUCCESS);
      } else {
        // Usage
        showErrorToast(formattedFinalMessage(result.Finalmessage), {
          autoClose: false,
          closeOnClick: false,
        });
      }
      let finalobj = [];
      if (result.ErrorObj && Object.keys(result.ErrorObj).length > 0) {
        let response = processErrorObj(
          result.ErrorObj,
          assignedPlant,
          updatedAssignedClasses,
          uniquePlant
        );
        console.log("response is ", response);
        if (response) {
          setUniqueData(response.uniquePlant);
          //setAssignedPlant(response.assignedPlant);
          finalobj = response.updatedAssignedClasses;
        }
      } else {
        finalobj = updatedAssignedClasses;
      }

      if (finalobj) {
        // change format of final object as the asignedPlant
        setAssignedPlant(finalobj);
        setDupInitialAssignedClasses(finalobj);
      }
    } else {
      setScreenLoader(false);
      showErrorToast(MSG_SAVE_FAILURE);
    }

    // showSuccessToast(MSG_SAVE_SUCCESS);
    // alert("Save action triggered. Check console for details.");
  };

  // Effect to initialize the droppable area
  useEffect(() => {
    if (!isDropped) {
      initializeDroppableArea();
    }
  }, [isDropped, initializeDroppableArea]);

  // Effect to set isTableLoading based on loadingParentDetails
  useEffect(() => {
    setIsTableLoading(loadingParentDetails);
  }, [loadingParentDetails]);

  // Update table data when droppedObjectData changes
  const newTableData = useMemo(
    () => getTableData(assignedPlant),
    [assignedPlant]
  );

  const uniqueTableData = useMemo(
    () => getUniqueTableData(uniqueData),
    [uniqueData]
  );
  console.log("[Plant Assignment] Unique Table Data:", uniqueTableData);

  // Update table data and reset isTableLoading when newTableData changes
  useEffect(() => {
    if (newTableData.length >= 0) {
      console.log("New Table Data:", newTableData);
      setTableData(newTableData);
      setTableKey((prevKey) => prevKey + 1); // Update table key
    }
  }, [newTableData]);

  // useEffect(() => {
  //   if (addedDataFromToolbar.length > 0) {
  //     console.log("[Plant Assignment] Table data", tableData);
  //     console.log("Added Data from Toolbar", addedDataFromToolbar);
  //     setAssignedPlant((prev) => [...addedDataFromToolbar, ...prev]);
  //     setTableKey((prevKey) => prevKey + 1); // Update table key
  //   }
  // }, [addedDataFromToolbar]);

  // Process card data
  const cardData = useMemo(
    () => getCardData(droppedObjectData),
    [droppedObjectData]
  );
  console.log(cardData);

  useEffect(() => {
    setIsCardDataAvailable(!!cardData);
  }, [cardData]);

  // Define columns for the table
  const columns = useMemo(() => tableColumns(CAName), [CAName]);

  const uniqueColumn = useMemo(() => uniqueColumns, []);

  const handleHomeClick = () => {
    initializeDroppableArea(); // Reset the droppable area
    // dispatch(false);
    dispatch(setIsDropped(false));
    dispatch(
      setDroppedObjectData({
        cardData: {},
        parentDetails: [],
        versions: [],
        initialDraggedData: [],
      })
    ); // Clear Redux state
    dispatch(
      setPlantObjectData({
        allPlants: [],
        initialAssignedPlants: [],
        uniquePlants: [],
        productChildren: [],
        CAName: false,
        headers: {},
      })
    );

    setTableData([]); // Clear local table data
    setIsCardDataAvailable(false);
    // showSuccessToast(MSG_WIDGET_RESET_SUCCESS);
  };
  useEffect(() => {
    console.log("[PlantAssignment] State Changes:", {
      loading,
      loadingParentDetails,
      isDropped,
    });
  }, [loading, loadingParentDetails, isDropped]);

  return (
    <>
      {screenLoader && (
        <div className="loading-overlay">
          <Loader />
          <p>Saving...</p>
        </div>
      )}
      {/* Show DragAndDropComponent initially and if not loading and nothing is dropped */}
      {!isDropped && !loading && !isTableLoading && <DragAndDropComponent />}

      {/* Content Wrapper - show if not initially loading or if card data is available */}
      {isDropped && (
        <>
          {/* Show initial loader when loading is true */}
          {loading && <Loader />}
          <div className="content-wrapper py-3 border-bottom">
            <div className="d-flex ">
              <div className=" p-0 pt-4">
                <Image
                  src="https://thewhitechamaleon.github.io/testrapp/images/home.png"
                  alt="home-icon"
                  className="home-icon"
                  onClick={handleHomeClick}
                />
              </div>
              {/* Always show card data if available */}
              {cardData && <CardWithDragAndDrop data={cardData} />}
            </div>
          </div>

          {/* Table Loader - show only when isTableLoading is true */}
          {isTableLoading ? (
            <div className="loading-indicator mt-5">
              <Loader />
            </div>
          ) : (
            <>
              <div className="wrapper-cta">
                <PlantAssignmentToolbarNativeCta
                  uniquedata={uniqueTableData}
                  data={tableData}
                  uniqueColumn={uniqueColumn}
                  CAName={CAName}
                  onAddPlant={handleAdded}
                  addedPlant={handleUnique}
                  onSave={handleSave}
                  onRemove={handleRemove}
                  state={state}
                />
                <ReusableTable
                  key={tableKey}
                  data={tableData}
                  columns={columns}
                  meta={{ updateTableData }}
                  widgetType="Plant_Assignment_Widget"
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default PlantAssignment;
