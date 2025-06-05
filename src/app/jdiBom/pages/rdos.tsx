import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import Loader from "src/components/Loader/Loader";
import {
  useCreateDestOrgsMutation,
  useDestOrgsQuery,
} from "../slices/apis/destOrgs.api";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { route } from "../constants";
import ExcelImporter from "./readFile";

type RdoKey =
  | "Daniel"
  | "Micro Motion"
  | "Rosmount Leve"
  | "Roxar"
  | "Ultrasonic";

const RDO_KEYS: RdoKey[] = [
  "Daniel",
  "Micro Motion",
  "Rosmount Leve",
  "Roxar",
  "Ultrasonic",
];

const RdoOrgSelector: React.FC = () => {
  const { data, isFetching } = useDestOrgsQuery({});
  const navigate = useNavigate();

  const pivotedRows = useMemo(() => {
    if (!data?.data) return [];

    const maxRows = Math.max(
      ...RDO_KEYS.map((rdo) => data.data[rdo]?.length || 0),
    );

    return Array.from({ length: maxRows }, (_, i) =>
      RDO_KEYS.map((rdo) => data.data[rdo]?.[i] ?? null),
    );
  }, [data]);

  const [_createDestOrgs] = useCreateDestOrgsMutation();

  // useEffect(() => {
  //   const get = async () => {
  //     await createDestOrgs({ ...RDO_ORGS, availOrgs: availOrgsList });
  //   };

  //   // get();
  // }, []);

  return (
    <Box p={3} sx={{ height: "100vh" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate(route.index)}
          sx={{
            fontSize: 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <HomeIcon sx={{ fontSize: 26 }} />
        </Button>

        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", margin: 0 }}
        >
          RDO Names
        </Typography>

        <ExcelImporter />
      </Box>

      {isFetching && <Loader />}

      <TableContainer
        component={Paper}
        sx={{ height: "calc(100% - 47px)", overflow: "auto" }}
      >
        <Table size="small">
          <TableHead
            sx={{
              backgroundColor: "background.paper",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <TableRow>
              {RDO_KEYS?.map((rdo) => (
                <TableCell
                  key={rdo}
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: 16 }}
                >
                  {rdo}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {!isFetching && pivotedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontSize: 18 }}
                  >
                    No data found. No organizations available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {pivotedRows?.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row?.map((org, colIndex) => (
                  <TableCell
                    key={colIndex}
                    align="center"
                    sx={{ fontSize: 14 }}
                  >
                    {org ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RdoOrgSelector;
