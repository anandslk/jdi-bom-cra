// pages/revisionFloat/dataHelpers.js
import { FaRegCopy } from "react-icons/fa";
export const getCardData = (droppedObjectData) => {
  if (!droppedObjectData || !droppedObjectData.cardData) {
    return null;
  }

  const item = droppedObjectData.cardData;

  let cardData = {
    title: item.Title || "N/A",
    type: item.Type || "N/A",
    "Maturity State": item["Maturity State"] || "N/A",
    owner: item.Owner || "N/A",
    "Collaborative Space Title": item["Collaborative Space Title"] || "N/A",
    Description: item.Description || "N/A",
    "Dropped Revision": item["Dropped Revision"] || "N/A",
    "Latest Released Revision": item["Latest Released Revision"] || "N/A",
    "CAD Format": item["CAD Format"] || "N/A",
    imageURL:
      item.imageURL ||
      "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/snresources/images/icons/large/I_VPMNavProduct108x144.png", // You might want a placeholder image URL
  };

  if (item.Type !== "Document") {
    cardData.EIN = item.EIN || "N/A";
    cardData["CAD Format"] = item["CAD Format"] || "N/A";
  }
  return cardData;
};

export const getTableData = (asignedPlant) => {
  if (!asignedPlant) return [];
  return asignedPlant.map((plant) => ({
    Plant: plant?.title || "N/A",
    Seq: plant?.Seq || "1",
    Status: "Current" || "N/A",
    "MFG Change": plant?.MFGChange || "N/A",
    "MFG Status": plant?.MFGStatus || "N/A",
    Change: plant?.Change || "N/A",
    "Change Status": plant?.ChangeStatus || "N/A",
    "Oracle Template": plant.OracleTemplate || "N/A",
    "ERP Status": "Active" || "N/A",
    "ERP Export": "Yes" || "N/A",
    "Lead Plant": false,
    MBom: plant.MBOM ? "Make" : "Buy" || "N/A",
    "Sort Value": "",
  }));
};

export const getUniqueTableData = (uniqueData) => {
  if (!uniqueData) return [];
  return uniqueData.map((plant) => ({
    "Available Plant": plant?.title || "N/A",
  }));
};

export const tableColumns = (CAName) => [
  { accessorKey: "Plant", header: "Plant" },
  { accessorKey: "Seq", header: "Seq" },
  {
    accessorKey: "MBom",
    header: "MBom",
    cell: ({ row, getValue, table }) => {
      const handleDropdownChange = (e) => {
        if (!CAName) return; // Prevent changes when disabled
        const updatedValue = e.target.value;

        // Update the table data state here
        const updatedData = table
          .getRowModel()
          .rows.map((r) =>
            r.id === row.id ? { ...r.original, MBom: updatedValue } : r.original
          );

        table.options.meta?.updateTableData(updatedData); // Call custom table update function
      };

      return (
        <select
          value={getValue()}
          onChange={handleDropdownChange}
          disabled={!CAName} // Disable dropdown if CAName is false
          className={`appearance-none bg-transparent border-none cursor-pointer focus:outline-none`}
          style={{
            ...(CAName === false && { appearance: "none" }), // Apply appearance: none only if CAName is false
            width: "70%",
            padding: "5px",
            fontSize: "14px",
            color: "#333",
            background: "none",
            border: "none",
            textAlign: "left",
          }}
          onMouseOver={(e) => {
            if (CAName) e.target.style.border = "1px solid #ccc";
          }}
          onMouseOut={(e) => {
            if (CAName) e.target.style.border = "none";
          }}
        >
          <option value="Make">Make</option>
          <option value="Buy">Buy</option>
        </select>
      );
    },
  },
  { accessorKey: "Status", header: "Status" },
  { accessorKey: "MFG Change", header: "MFG Change" },
  { accessorKey: "MFG Status", header: "MFG Status" },
  { accessorKey: "Change", header: "Change" },
  { accessorKey: "Change Status", header: "Change Status" },
  { accessorKey: "Oracle Template", header: "Oracle Template" },
  { accessorKey: "ERP Status", header: "ERP Status" },
  { accessorKey: "ERP Export", header: "ERP Export" },
  { accessorKey: "Lead Plant", header: "Lead Plant" },

  { accessorKey: "Sort Value", header: "Sort Value" },
];

export const uniqueColumns = [
  { accessorKey: "Available Plant", header: "Available Plant" },
];

// export function processErrorObj(
//   errorObj,
//   assignedPlant,
//   uniquePlant,
//   updatedAssignedClasses
// ) {
//   console.log("Assigned Plants are:", assignedPlant);
//   console.log("unique Plants are:", uniquePlant);
//   errorObj.forEach((item) => {
//     if (item.type === "New") {
//       // Remove from assignedPlant

//       assignedPlant = assignedPlant.filter(
//         (plant) => plant.title !== item.title
//       );

//       // Add to uniquePlant if not already present
//       if (!uniquePlant.some((plant) => plant.title === item.title)) {
//         uniquePlant.push(item);
//       }
//     } else if (item.type === "Update") {
//       // Modify mbom to "buy" in assignedPlant
//       assignedPlant = assignedPlant.map((plant) =>
//         plant.title === item.title ? { ...plant, MBom: "buy" } : plant
//       );
//     }
//   });

//   // Update the table (assuming a render function exists)

//   return { assignedPlant, uniquePlant };
// }

export function processErrorObj(
  errorObj,
  assignedPlant,
  updatedAssignedClasses,
  uniquePlant
) {
  console.log("Assigned Plants are:", assignedPlant);
  console.log("unique Plants are:", uniquePlant);
  errorObj.forEach((item) => {
    if (item.type === "New") {
      // Remove from assignedPlant

      updatedAssignedClasses = updatedAssignedClasses.filter(
        (plant) => plant.title !== item.title
      );

      // Add to uniquePlant if not already present
      if (!uniquePlant.some((plant) => plant.title === item.title)) {
        uniquePlant.push(item);
      }
    } else if (item.type === "Update") {
      // Modify mbom to "buy" in assignedPlant
      updatedAssignedClasses = updatedAssignedClasses.map((plant) =>
        plant.title === item.title ? { ...plant, MBOM: "false" } : plant
      );
    }
  });

  // Update the table (assuming a render function exists)

  return { updatedAssignedClasses, uniquePlant };
}

export const formattedFinalMessage = (finalMessage) => {
  if (!finalMessage) return "An error occurred.";

  const messageList = finalMessage
    .split("\n")
    .filter((msg) => msg.trim() !== "");

  const handleCopy = () => {
    const textToCopy = messageList.map((msg) => `- ${msg}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div
      style={{
        userSelect: "text",
        cursor: "text",
        position: "relative",
        paddingRight: "40px",
      }}
    >
      <strong>Errors:</strong>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          right: "10px",
          top: "-12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          color: "grey",
        }}
      >
        <FaRegCopy size={12} />
      </button>
      <ol>
        {messageList.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ol>
    </div>
  );
};
