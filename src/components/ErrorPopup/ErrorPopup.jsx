import React, { useMemo } from "react";
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import "./ErrorPopup.css";
import { handleExportExcel } from "../../utils/helpers";
import ReusableAlert from "../Alert/ReusableAlert";
import CustomButton from "../Button/Button";

const ErrorPopup = ({ errors }) => {
  const processedErrors = useMemo(() => {
    // Group errors by row number
    const errorGroups = errors.reduce((groups, error) => {
      const rowMatch = error.match(/Row (\d+):/);
      const columnMatch = error.match(/"([^"]*)" (?:is required|value)/);
      const errorMsg = error.split(": ").slice(1).join(": ");

      const rowNumber = rowMatch ? rowMatch[1] : "N/A";
      const columnName = columnMatch
        ? columnMatch[1]
        : error.includes("Collaborative Space", "Quantity")
        ? "Collaborative Space"
        : "N/A";

      if (!groups[rowNumber]) {
        groups[rowNumber] = {
          rowNumber,
          columns: [],
          errors: [],
        };
      }

      groups[rowNumber].columns.push(columnName);
      groups[rowNumber].errors.push(errorMsg || error);

      return groups;
    }, {});

    // Convert groups to array and sort by row number
    return Object.values(errorGroups).sort(
      (a, b) => Number(a.rowNumber) - Number(b.rowNumber)
    );
  }, [errors]);

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });

  const handleExportErrors = () => {
    // Transform processedErrors into a format suitable for Excel
    const exportData = processedErrors.map((error) => ({
      "Row Number": error.rowNumber,
      "Column Names": error.columns.join(", "),
      "Error Description": error.errors.join("; "),
    }));

    // Call the handleExportExcel function with the transformed data
    handleExportExcel(exportData, "validation-errors.xlsx");
  };
  const rowRenderer = ({ key, index, style, parent }) => {
    const error = processedErrors[index];
    return (
      <CellMeasurer
        key={key}
        cache={cache}
        columnIndex={0}
        rowIndex={index}
        parent={parent}
      >
        <div style={style} className="table-row">
          <div className="table-cell" style={{ width: "15%" }}>
            {error.rowNumber}
          </div>
          <div className="table-cell" style={{ width: "25%" }}>
            {error.columns.map((column, i) => (
              <div key={i}>{column}</div>
            ))}
          </div>
          <div className="table-cell" style={{ width: "60%" }}>
            <ul className="error-list">
              {error.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </CellMeasurer>
    );
  };

  return (
    <div className="error-popup-container">
      <div className="error-header-container">
        <div></div>
        <CustomButton
          variant="success"
          onClick={handleExportErrors}
          className="mb-3"
          text="Export to Excel"
          size="lg"
        />
      </div>
      <ReusableAlert
        variant="danger"
        message={
          <>
            <strong>⚠️ Note:</strong> Below reports show only uploaded
            spreadsheet error rows. To resolve these issues, update the
            spreadsheet and re-import. ({processedErrors.length} errors found)
          </>
        }
        className="custom-alert"
      />

      <div className="table-wrapper">
        {/* Static Header */}
        <div className="static-header">
          <div className="header-cell" style={{ width: "15%" }}>
            Row Number
          </div>
          <div className="header-cell" style={{ width: "25%" }}>
            Column Name
          </div>
          <div className="header-cell" style={{ width: "60%" }}>
            Error Description
          </div>
        </div>

        {/* Virtualized Error List */}
        <div className="table-container">
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={processedErrors.length}
                rowHeight={cache.rowHeight}
                deferredMeasurementCache={cache}
                rowRenderer={rowRenderer}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
