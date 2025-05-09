import React from "react";
import StaticTable from "../../components/bootsrap-table/Table";

const MappedList = ({
  columnHeaders,
  mandatoryAttributes,
  selectedMappings,
  setSelectedMappings,
  dropdownOptions,
  allNLSValues,
  operationChoice,
}) => {
  console.log("MappedList - Received columnHeaders:", columnHeaders);
  console.log(
    "MappedList - Received mandatoryAttributes:",
    mandatoryAttributes
  );
  console.log("MappedList - Received dropdownOptions:", dropdownOptions);
  console.log("MappedList - Received operationChoice:", operationChoice);
  console.log("MappedList - Received allNLSValues:", allNLSValues);

  // Checks if column header matches any NLS value
  const hasMatchingNLS = (header) => {
    if (!Array.isArray(allNLSValues)) {
      console.warn("allNLSValues is not an array:", allNLSValues);
      return false;
    }

    const normalizedHeader = header.toLowerCase().trim();
    const hasMatch = allNLSValues.some(
      (nls) => nls.toLowerCase().trim() === normalizedHeader
    );
    // console.log(
    //   `Checking if header '${header}' matches any NLS value:`,
    //   hasMatch
    // );
    return hasMatch;
  };

  // Gets backend name for selected UI label
  const getBackendNameForUILabel = (uiLabel) => {
    console.log("Finding backend name for UI label:", uiLabel);
    console.log("Current dropdown options:", dropdownOptions);

    if (
      !dropdownOptions ||
      !Array.isArray(dropdownOptions) ||
      dropdownOptions.length === 0
    ) {
      console.warn("No dropdown options available");
      return uiLabel;
    }

    const option = dropdownOptions.find((opt) => opt.uiLabel === uiLabel);
    console.log("Found option:", option);
    return option ? option.backendName : uiLabel;
  };

  // Prepare dropdown options for the table - filter out already selected values
  const prepareDropdownOptions = (currentColumnHeader) => {
    // console.log("Preparing dropdown options for column:", currentColumnHeader);

    if (
      !dropdownOptions ||
      !Array.isArray(dropdownOptions) ||
      dropdownOptions.length === 0
    ) {
      console.warn("No dropdown options available for filtering");
      return [];
    }

    // Check if current header has a matching NLS value or is mandatory
    const currentHeaderHasNLS = hasMatchingNLS(currentColumnHeader);
    const isCurrentHeaderMandatory =
      mandatoryAttributes.includes(currentColumnHeader);
    const shouldExcludeOwnLabel =
      currentHeaderHasNLS || isCurrentHeaderMandatory;

    // For debugging
    // console.log(
    //   `Column '${currentColumnHeader}': has NLS match=${currentHeaderHasNLS}, is mandatory=${isCurrentHeaderMandatory}, should exclude own label=${shouldExcludeOwnLabel}`
    // );

    // Get currently selected values to filter them out (from other columns)
    const selectedValues = Object.entries(selectedMappings)
      .filter(([header]) => header !== currentColumnHeader)
      .map(([_, mapping]) => mapping.uiLabel || mapping.mappedAttribute);

    // For operation 2, we want to group options by their categories
    if (operationChoice === "2") {
      // Create grouped options structure
      const groupedOptions = [];

      // Look for EBOM attributes in the dropdown options
      const ebomAttributes = dropdownOptions
        .filter((attr) => {
          // Basic filters first
          const isEBOMAttribute = attr.group === "EBOM Attributes";
          const isAlreadySelected = selectedValues.includes(attr.uiLabel);

          // Check if this attribute matches ANY NLS value
          const matchesAnyNLS = allNLSValues.some(
            (nls) =>
              nls.toLowerCase().trim() === attr.uiLabel.toLowerCase().trim()
          );

          // Check if this attribute is in the mandatory list
          const isMandatory = mandatoryAttributes.includes(attr.uiLabel);

          // Only exclude if it matches an NLS value AND is mandatory
          const shouldExclude = matchesAnyNLS && isMandatory;

          // For debugging
          if (shouldExclude) {
            // console.log(
            //   `Excluding from dropdown: ${attr.uiLabel} (NLS match: ${matchesAnyNLS}, mandatory: ${isMandatory})`
            // );
          }

          return isEBOMAttribute && !isAlreadySelected && !shouldExclude;
        })
        .map((attr) => ({
          value: attr.uiLabel,
          label: attr.uiLabel,
        }));

      // Always add EBOM Attributes group if we have any EBOM attributes
      if (ebomAttributes.length > 0) {
        groupedOptions.push({
          label: "EBOM Attributes",
          options: ebomAttributes,
        });
      }

      // Add any Part Attributes group with the same filtering logic
      const partAttributes = dropdownOptions
        .filter((attr) => {
          const isNotEBOMAttribute = attr.group !== "EBOM Attributes";
          const isNotSystemAttribute = attr.group !== "System Attributes";
          const isAlreadySelected = selectedValues.includes(attr.uiLabel);

          // Check if this attribute matches ANY NLS value - same as non-operation 2 logic
          const matchesAnyNLS = allNLSValues.some(
            (nls) =>
              nls.toLowerCase().trim() === attr.uiLabel.toLowerCase().trim()
          );

          // Check if this attribute is in the mandatory list
          const isMandatory = mandatoryAttributes.includes(attr.uiLabel);

          // Only exclude if it matches an NLS value AND is mandatory
          const shouldExclude = matchesAnyNLS && isMandatory;

          // For debugging
          if (shouldExclude) {
            // console.log(
            //   `Excluding from dropdown: ${attr.uiLabel} (NLS match: ${matchesAnyNLS}, mandatory: ${isMandatory})`
            // );
          }

          return (
            isNotEBOMAttribute &&
            isNotSystemAttribute &&
            !isAlreadySelected &&
            !shouldExclude
          );
        })
        .map((attr) => ({
          value: attr.uiLabel,
          label: attr.uiLabel,
        }));

      if (partAttributes.length > 0) {
        groupedOptions.push({
          label: "Item Attributes",
          options: partAttributes,
        });
      }

      return groupedOptions;
    }

    // For other operations, return flat list with the same filtering logic
    const filteredOptions = dropdownOptions
      .filter((attr) => {
        const isAlreadySelected = selectedValues.includes(attr.uiLabel);

        // Check if this attribute matches ANY NLS value
        const matchesAnyNLS = allNLSValues.some(
          (nls) =>
            nls.toLowerCase().trim() === attr.uiLabel.toLowerCase().trim()
        );

        // Check if this attribute is in the mandatory list
        const isMandatory = mandatoryAttributes.includes(attr.uiLabel);

        // Only exclude if it matches an NLS value AND is mandatory
        const shouldExclude = matchesAnyNLS && isMandatory;

        // For debugging
        if (shouldExclude) {
          // console.log(
          //   `Excluding from dropdown: ${attr.uiLabel} (NLS match: ${matchesAnyNLS}, mandatory: ${isMandatory})`
          // );
        }

        // Return true to keep items that are either NOT already selected OR don't meet exclusion criteria
        return !isAlreadySelected && !shouldExclude;
      })
      .map((attr) => ({
        value: attr.uiLabel,
        label: attr.uiLabel,
      }));

    // console.log(
    //   "Final filteredOptions for column:",
    //   currentColumnHeader,
    //   filteredOptions
    // );

    return filteredOptions;
  };

  // Handles selection changes from Table
  const handleSelectChange = (columnHeader, value) => {
    console.log(
      "Selection changed for column:",
      columnHeader,
      "to value:",
      value
    );

    const backendName = getBackendNameForUILabel(value);
    console.log("Mapped backend name:", backendName);

    setSelectedMappings((prev) => ({
      ...prev,
      [columnHeader]: {
        columnName: columnHeader,
        uiLabel: value,
        mappedAttribute: backendName,
        isMandatory: mandatoryAttributes.includes(columnHeader),
      },
    }));
  };

  // Prepare column data with all needed information
  const prepareColumnsData = () => {
    return columnHeaders.map((header) => {
      const hasNLS = hasMatchingNLS(header);
      const isMandatory = mandatoryAttributes.includes(header);

      // Special handling for operation 2 - disable system attributes even if not mandatory
      let shouldBeDisabled = hasNLS && isMandatory;

      if (operationChoice === "2" && hasNLS) {
        // Check if this is a system attribute for operation 2
        const isSystemAttribute = [
          "Description",
          "EIN Number",
          "Type",
          "Title",
          "Collaborative Space",
          "Physical Product/Raw Material",
        ].some(
          (attr) => header.toLowerCase().trim() === attr.toLowerCase().trim()
        );

        // For operation 2, disable if it's a system attribute regardless of mandatory status
        if (isSystemAttribute) {
          shouldBeDisabled = true;
          // console.log(
          //   `Operation 2: Disabling system attribute '${header}' regardless of mandatory status`
          // );
        }
      }

      return {
        header,
        isMandatory,
        hasNLS,
        currentMapping: selectedMappings[header],
        defaultLabel: hasNLS ? header : "Please select from Drop Down",
        disabled: shouldBeDisabled,
      };
    });
  };

  return (
    <StaticTable
      columnHeaders={prepareColumnsData()}
      handleSelectChange={handleSelectChange}
      selectedMappings={selectedMappings}
      dropdownOptions={(header) => prepareDropdownOptions(header)}
    />
  );
};

export default MappedList;
