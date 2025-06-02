import React, { useState } from "react";
import * as XLSX from "xlsx";
import BackupIcon from "@mui/icons-material/Backup";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

/**
 * A mapping of RDO keys to arrays of Org Names,
 * plus a list of all available organizations.
 */
export interface IRDO_ORGS {
  [key: string]: string[];
  availOrgs: string[];
}

export default function ExcelImporter() {
  const [_orgs, setOrgs] = useState<IRDO_ORGS | null>(null);
  const [pendingOrgs, setPendingOrgs] = useState<IRDO_ORGS | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    const targetSheetName = workbook.SheetNames.includes(
      "JDI ERP Orgs Management",
    )
      ? "JDI ERP Orgs Management"
      : workbook.SheetNames[0];
    const sheet = workbook.Sheets[targetSheetName];
    if (!sheet) {
      setError(`Sheet '${targetSheetName}' not found.`);
      return;
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (rows.length < 2) {
      setError("No data rows found");
      return;
    }

    const headers = (rows[0] as string[]).map((h) => h.trim());
    const rdoCol = headers.findIndex((h) => /RDO/i.test(h));
    const orgCol = headers.findIndex((h) => /Org\s?Na(me)?\b/i.test(h));

    if (rdoCol === -1 || orgCol === -1) {
      setError(
        `Missing 'RDO' or 'Org Name' columns. Found headers: ${headers.join(", ")}`,
      );
      return;
    }

    const result: IRDO_ORGS = { availOrgs: [] };
    for (let i = 1; i < rows.length; i++) {
      const rdoKey = String(rows[i][rdoCol] ?? "").trim();
      const orgName = String(rows[i][orgCol] ?? "").trim();
      if (!rdoKey || !orgName) continue;

      if (!result[rdoKey]) result[rdoKey] = [];
      if (!result[rdoKey].includes(orgName)) result[rdoKey].push(orgName);
      if (!result.availOrgs.includes(orgName)) result.availOrgs.push(orgName);
    }

    if (result.availOrgs.length === 0) {
      setError("No valid RDO/Org Name pairs found");
      return;
    }

    setPendingOrgs(result);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingOrgs) {
      setOrgs(pendingOrgs);
    }
    setDialogOpen(false);
    setPendingOrgs(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setPendingOrgs(null);
  };

  return (
    <>
      <IconButton component="label">
        <BackupIcon />
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} hidden />
      </IconButton>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <Dialog open={dialogOpen} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 23 }}>
          Confirm Imported Organizations
        </DialogTitle>
        <DialogContent dividers>
          {pendingOrgs && (
            <List dense>
              {Object.entries(pendingOrgs)
                .filter(([key]) => key !== "availOrgs")
                .map(([rdo, orgList]) => (
                  <React.Fragment key={rdo}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} sx={{ fontSize: 16 }}>
                            {rdo}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: "light",
                              color: "text.secondary",
                            }}
                          >
                            {orgList.join(", ")}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            color="secondary"
            sx={{ fontSize: 15 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            sx={{ fontSize: 15 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import BackupIcon from "@mui/icons-material/Backup";
// import {
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
// } from "@mui/material";

// /**
//  * A mapping of RDO keys to arrays of Org Names,
//  * plus a list of all available organizations.
//  */
// export interface IRDO_ORGS {
//   [key: string]: string[];
//   availOrgs: string[];
// }

// export default function ExcelImporter() {
//   const [_orgs, setOrgs] = useState<IRDO_ORGS | null>(null);
//   const [pendingOrgs, setPendingOrgs] = useState<IRDO_ORGS | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     if (!e.target.files?.length) return;
//     const file = e.target.files[0];

//     const data = await file.arrayBuffer();
//     const workbook = XLSX.read(data, { type: "array" });

//     const targetSheetName = workbook.SheetNames.includes(
//       "JDI Org Assign by RDO",
//     )
//       ? "JDI Org Assign by RDO"
//       : workbook.SheetNames[0];

//     const sheet = workbook.Sheets[targetSheetName];
//     if (!sheet) {
//       setError(`Sheet '${targetSheetName}' not found.`);
//       return;
//     }

//     const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
//       header: 1,
//       defval: "",
//     });

//     if (rows.length < 2) {
//       setError("No data rows found");
//       return;
//     }

//     const headerRow = rows[0].map((h) => String(h).trim());

//     // Helper to normalize and compare headers
//     const normalize = (str: string) =>
//       str
//         .replace(/\s+/g, " ")
//         .replace(/[^\w\s]/gi, "")
//         .trim()
//         .toLowerCase();

//     const normalizedHeaderRow = headerRow.map(normalize);

//     const knownRDOs = [
//       "Micro Motion (MMI)",
//       "Rosemount Flow (RF)",
//       "ROXAR",
//       "ROXAR CES (add on's using List of Orgs)",
//       "ULTRASONIC (USM)",
//     ];
//     const normalizedRDOs = knownRDOs.map(normalize);

//     const rdoIndices: { [rdo: string]: number } = {};
//     normalizedRDOs.forEach((normName, i) => {
//       const idx = normalizedHeaderRow.findIndex((h) => h === normName);
//       if (idx !== -1) {
//         rdoIndices[knownRDOs[i]] = idx;
//       }
//     });

//     // Match ORG CODE column
//     const orgCodeCol = normalizedHeaderRow.findIndex((h) =>
//       /org\s*code/i.test(h),
//     );

//     // Show header debug if not found
//     if (orgCodeCol === -1 || Object.keys(rdoIndices).length === 0) {
//       setError(
//         `Required columns missing. Found headers: ${headerRow.join(", ")}`,
//       );
//       return;
//     }

//     const result: IRDO_ORGS = { availOrgs: [] };

//     for (let i = 1; i < rows.length; i++) {
//       const orgCode = String(rows[i][orgCodeCol] ?? "").trim();
//       if (!orgCode) continue;

//       Object.entries(rdoIndices).forEach(([rdo, colIdx]) => {
//         const val = String(rows[i][colIdx] ?? "")
//           .trim()
//           .toLowerCase();
//         if (val === "yes") {
//           if (!result[rdo]) result[rdo] = [];
//           if (!result[rdo].includes(orgCode)) result[rdo].push(orgCode);
//         }
//       });

//       if (!result.availOrgs.includes(orgCode)) {
//         result.availOrgs.push(orgCode);
//       }
//     }

//     if (result.availOrgs.length === 0) {
//       setError("No valid RDO/org assignments found");
//       return;
//     }

//     setPendingOrgs(result);
//     setDialogOpen(true);
//   };

//   const handleConfirm = () => {
//     if (pendingOrgs) {
//       setOrgs(pendingOrgs);
//     }
//     setDialogOpen(false);
//     setPendingOrgs(null);
//   };

//   const handleCancel = () => {
//     setDialogOpen(false);
//     setPendingOrgs(null);
//   };

//   return (
//     <>
//       <IconButton component="label">
//         <BackupIcon />
//         <input type="file" accept=".xlsx, .xls" onChange={handleFile} hidden />
//       </IconButton>

//       {error && <div style={{ color: "red" }}>{error}</div>}

//       <Dialog open={dialogOpen} onClose={handleCancel} fullWidth maxWidth="sm">
//         <DialogTitle sx={{ fontSize: 23 }}>
//           Confirm Imported Organizations
//         </DialogTitle>
//         <DialogContent dividers>
//           {pendingOrgs && (
//             <List dense>
//               {Object.entries(pendingOrgs)
//                 .filter(([key]) => key !== "availOrgs")
//                 .map(([rdo, orgList]) => (
//                   <React.Fragment key={rdo}>
//                     <ListItem>
//                       <ListItemText
//                         primary={
//                           <Typography fontWeight={600} sx={{ fontSize: 16 }}>
//                             {rdo}
//                           </Typography>
//                         }
//                         secondary={
//                           <Typography
//                             sx={{
//                               fontSize: 14,
//                               fontWeight: "light",
//                               color: "text.secondary",
//                             }}
//                           >
//                             {orgList.join(", ")}
//                           </Typography>
//                         }
//                       />
//                     </ListItem>
//                     <Divider />
//                   </React.Fragment>
//                 ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={handleCancel}
//             color="secondary"
//             sx={{ fontSize: 15 }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirm}
//             variant="contained"
//             color="primary"
//             sx={{ fontSize: 15 }}
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }
