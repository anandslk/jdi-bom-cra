import React, { useMemo, useState, useEffect } from "react";
import CustomModal from "../Modal/customModal";
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import "react-virtualized/styles.css";
import "./SuccessModal.css";
import ReusableAlert from "../Alert/ReusableAlert";
import { handleExportExcel } from "../../utils/helpers";
import CustomButton from "../Button/Button";
import Pagination from "../Pagination/Pagination";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const SuccessModal = ({
  show = false,
  onHide = () => {},
  responseData = [],
}) => {
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState({});
  const [copiedCell, setCopiedCell] = useState(null); // Change to: {rowIndex: null, colIndex: null}

  // Memoized CellMeasurer cache
  const cache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 50,
    });
  }, []);

  // Preprocess response data to flatten nested arrays
  const flattenedData = useMemo(() => {
    // Function to flatten nested arrays
    const flatten = (data) => {
      if (!data || !Array.isArray(data)) return [];

      // First, check if we have an array of arrays
      const isNestedArray = data.some((item) => Array.isArray(item));

      if (isNestedArray) {
        // Flatten one level of arrays
        return data.flatMap((item) => (Array.isArray(item) ? item : [item]));
      }

      return data;
    };

    return flatten(responseData);
  }, [responseData]);

  // Dynamically generate columns based on the flattened response data
  const columns = useMemo(() => {
    if (!flattenedData || flattenedData.length === 0) return [];

    // Collect all unique keys from ALL items in the flattened data
    const allKeys = new Set();
    flattenedData.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    // Helper function to format header text

    const formatHeaderText = (key) => {
      // Replace underscores and hyphens with spaces
      const spacedText = key.replace(/[_-]/g, " ");

      // Convert to title case (capitalize first letter of each word)
      return spacedText
        .split(" ")
        .map((word) =>
          word === word.toUpperCase()
            ? word // preserve acronyms like EIN, ID
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    };

    // Convert keys to column definitions
    return Array.from(allKeys).map((key) => {
      let width = columnWidths[key] || 120;

      // Set different widths based on the column content type
      if (key.toLowerCase().includes("message")) {
        width = columnWidths[key] || 200; // Message columns are wider
      } else if (key.toLowerCase().includes("status")) {
        width = columnWidths[key] || 100;
      }

      return {
        key: key,
        header: formatHeaderText(key), // Use the formatted header text
        width: width,
        tooltip: formatHeaderText(key), // Update tooltip too
      };
    });
  }, [flattenedData, columnWidths]);

  const handleResize = (key, newWidth) => {
    setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
  };

  // Paginate response data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return flattenedData.slice(start, start + itemsPerPage);
  }, [currentPage, flattenedData]);

  const handleExport = () => {
    handleExportExcel(flattenedData, "upload-results.xlsx");
  };

  console.log("SuccessModal received response data:", responseData);
  console.log("Generated columns:", columns);

  useEffect(() => {
    cache.clearAll();
  }, [paginatedData, cache]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Safe getter function to handle case sensitivity and missing properties
  const getItemValue = (item, key) => {
    if (!item || typeof item !== "object") return "-";

    // Direct match
    if (item[key] !== undefined) return item[key];

    // Case-insensitive match
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(item)) {
      if (k.toLowerCase() === lowerKey) {
        return item[k];
      }
    }

    return "-";
  };

  // Function to copy a single cell value
  const handleCopyCellValue = (value, rowIndex, colIndex, buttonElement) => {
    if (!value || value === "-") return;

    // Convert objects or arrays to JSON string before copying
    const textToCopy =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        // Add the copied class to the button itself
        if (buttonElement) {
          buttonElement.classList.add("copied");

          // Remove the class after 1.5 seconds
          setTimeout(() => {
            buttonElement.classList.remove("copied");
          }, 1000);
        }

        // We can keep this for tracking which cell was copied if needed
        setCopiedCell({ rowIndex, colIndex });
        setTimeout(() => setCopiedCell(null), 1500);
      })
      .catch((err) => {
        console.error("Failed to copy cell value:", err);
      });
  };
  const rowRenderer = ({ key, index, style, parent }) => {
    const item = paginatedData[index];
    if (!item) return null;

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        columnIndex={0}
        rowIndex={index}
        parent={parent}
      >
        <div style={style} className="virtualized-row">
          {columns.map((column, colIndex) => {
            const value = getItemValue(item, column.key);

            // Convert any object/array values to string for display
            const displayValue =
              typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value);

            // Check if this specific cell position is copied
            const isCopied =
              copiedCell &&
              copiedCell.rowIndex === index &&
              copiedCell.colIndex === colIndex;

            // Special handling for status field
            if (column.key.toLowerCase().includes("status")) {
              const statusValue = String(value).toLowerCase();
              const statusClass = statusValue.includes("success")
                ? "success"
                : statusValue.includes("fail") || statusValue.includes("error")
                ? "failed"
                : "";

              return (
                <div
                  key={colIndex}
                  className={`virtualized-cell status-cell ${statusClass} ${
                    isCopied ? "copied" : ""
                  }`}
                  style={{ width: column.width, position: "relative" }}
                  title={displayValue}
                >
                  {displayValue}
                  <button
                    className="cell-copy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass the button element reference to the handler
                      handleCopyCellValue(
                        value,
                        index,
                        colIndex,
                        e.currentTarget
                      );
                    }}
                    aria-label="Copy cell value"
                    title="Copy to clipboard"
                  >
                    {/* Copy icon (visible by default) */}
                    <svg
                      className="copy-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>

                    {/* Checkmark icon (initially hidden) */}
                    <svg
                      className="copied-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </button>
                </div>
              );
            }

            // Default handling for other fields
            return (
              <div
                key={colIndex}
                className={`virtualized-cell ${isCopied ? "copied" : ""}`}
                style={{ width: column.width, position: "relative" }}
                title={displayValue}
              >
                {displayValue}
                <button
                  className="cell-copy-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCellValue(value, index, colIndex);
                  }}
                  aria-label="Copy cell value"
                  title="Copy to clipboard"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </CellMeasurer>
    );
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      title="Upload Results"
      size="lg"
      footerButtons={[
        {
          label: "Close",
          variant: "danger",
          onClick: onHide,
        },
      ]}
    >
      <div className="success-modal-content">
        <div className="top-bar">
          <div></div>
          <CustomButton
            variant="success"
            size="lg"
            onClick={handleExport}
            className="m-2 border-bottom-10px"
            text="Export to Excel "
          />
        </div>

        <ReusableAlert
          variant="success"
          message={
            <p className="success-message-text">
              ✅ <strong>Success:</strong> {flattenedData.length} item
              {flattenedData.length > 1 ? "s" : ""} processed.
            </p>
          }
          className="mb-3"
        />

        {columns.length > 0 ? (
          <>
            <div className="virtualized-table-container">
              <div className="virtualized-header" style={{ display: "flex" }}>
                {columns.map((column, idx) => (
                  <ResizableBox
                    key={column.key}
                    width={column.width}
                    height={30}
                    axis="x"
                    resizeHandles={["e"]}
                    handle={
                      <span
                        className="custom-resizer"
                        style={{
                          cursor: "col-resize",
                          width: 8,
                          height: "100%",
                          display: "inline-block",
                          position: "absolute",
                          right: 0,
                          top: 0,
                        }}
                      />
                    }
                    onResizeStop={(e, data) =>
                      handleResize(column.key, data.size.width)
                    }
                    minConstraints={[90, 30]}
                    maxConstraints={[200, 30]}
                  >
                    <div
                      className="virtualized-header-cell"
                      style={{
                        width: column.width,
                        minWidth: 90,
                        maxWidth: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        userSelect: "none",
                        paddingRight: 8,
                        boxSizing: "border-box",
                      }}
                      title={column.header}
                    >
                      {column.header}
                    </div>
                  </ResizableBox>
                ))}
              </div>

              <div className="virtualized-body">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      width={width}
                      height={height - 10}
                      rowCount={paginatedData.length}
                      rowHeight={cache.rowHeight}
                      deferredMeasurementCache={cache}
                      rowRenderer={rowRenderer}
                      overscanRowCount={5}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={flattenedData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="no-data-message">No response data available.</div>
        )}
      </div>
    </CustomModal>
  );
};

export default SuccessModal;
