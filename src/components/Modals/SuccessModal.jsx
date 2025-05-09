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

const SuccessModal = ({
  show = false,
  onHide = () => {},
  responseData = [],
}) => {
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized CellMeasurer cache
  const cache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 50,
    });
  }, []);

  // Dynamically generate columns based on the response data
  const columns = useMemo(() => {
    if (!responseData || responseData.length === 0) return [];

    // Collect all unique keys from ALL items in the response data
    const allKeys = new Set();
    responseData.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
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
      // Set appropriate widths based on column type
      let width = "20%";
      if (
        key.toLowerCase().includes("message") ||
        key.toLowerCase().includes("description")
      ) {
        width = "40%";
      } else if (key.toLowerCase().includes("status")) {
        width = "15%";
      } else if (key.toLowerCase().includes("revision")) {
        width = "10%";
      } else if (
        key.toLowerCase().includes("ein") ||
        key.toLowerCase().includes("number")
      ) {
        width = "25%";
      }

      return {
        key: key,
        header: formatHeaderText(key), // Use the formatted header text
        width: width,
        tooltip: formatHeaderText(key), // Update tooltip too
      };
    });
  }, [responseData]);

  // Paginate response data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return responseData.slice(start, start + itemsPerPage);
  }, [currentPage, responseData]);

  const handleExport = () => {
    handleExportExcel(responseData, "upload-results.xlsx");
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
                  className={`virtualized-cell status-cell ${statusClass}`}
                  style={{ width: column.width }}
                  title={String(value)}
                >
                  {value}
                </div>
              );
            }

            // Default handling for other fields
            return (
              <div
                key={colIndex}
                className="virtualized-cell"
                style={{ width: column.width }}
                title={String(value)}
              >
                {String(value)}
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
              ✅ <strong>Success:</strong> {responseData.length} item
              {responseData.length > 1 ? "s" : ""} processed.
            </p>
          }
          className="mb-3"
        />

        {columns.length > 0 ? (
          <>
            <div className="virtualized-table-container">
              <div className="virtualized-header">
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className="virtualized-header-cell"
                    style={{ width: column.width }}
                    title={column.header} // Added tooltip
                  >
                    {column.header}
                  </div>
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
              totalItems={responseData.length}
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
