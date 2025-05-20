import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
// import RefreshIcon from "@mui/icons-material/Refresh";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

import { Dialog } from "../components/Dialog";
import {
  BomResponse,
  useCreateJdiBomMutation,
  useDeleteAllMutation,
  useJdiBomsQuery,
  useUpdateJdiBomMutation,
} from "../slices/apis/jdiBom.api";
import DateRange from "../components/DateRange";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { setIsDropped } from "../slices/reducers/jdiBom.reducer";
import { useAppDispatch, useAppSelector } from "../store";
import { route } from "../constants";

type Status = "In Process" | "Processing" | "Completed" | "Failed";

const getStatusColor = (status: Status) => {
  switch (status) {
    case "In Process":
      return "warning";
    case "Completed":
      return "success";
    case "Failed":
      return "error";
    default:
      return "default";
  }
};

const renderChipsWithEllipsis = (items: string[], limit: number = 2) => {
  const display = items.slice(0, limit);
  const extra = items.length - limit;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {display.map((item, idx) => (
        <Chip key={idx} label={item} size="small" sx={{ fontSize: 14 }} />
      ))}
      {extra > 0 && (
        <Chip
          label={`+${extra} more`}
          size="small"
          //  color=""
          variant="outlined"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      )}
    </Box>
  );
};

export default function BomCommoningStatusTable() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const objectDetails = useAppSelector((state) => state.jdiBom.objectDetails);

  const { data, isFetching } = useJdiBomsQuery({
    search,
    status: statusFilter,
    sortOrder,
    pageNumber: page + 1,
    pageSize: rowsPerPage,
  }) as { data?: BomResponse; isFetching: boolean };

  const [mutate] = useCreateJdiBomMutation();
  const [deleteAllJdi] = useDeleteAllMutation();
  const [updateJdi] = useUpdateJdiBomMutation();

  const [selectedItem, setSelectedItem] = useState<
    BomResponse["data"][0] | null
  >(null);
  const [open, setOpen] = useState(false);

  const create = async () => {
    await mutate({
      requestID: "REQ12345",
      status: "Completed",
      sourceORG: "MVO",
      userId: "1743650926892",
      userEmail: "anand@em.com",
      processedItems: [
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
        { Segment1: "MMI-100" },
      ],
      targetOrgs: ["AD1", "AO1", "AT1", "AY5", "AZ5", "BES", "CDC", "CHS"],
    });
  };

  const update = async (id: string) => {
    await updateJdi({
      id,
      updates: {
        status: "In Process",
      },
      // requestID: "REQ12345",
      // status: "Completed",
      // // sourceORG: "MVO",
      // processedItems: [
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      //   { Segment1: "MMI-100" },
      // ],
      // targetOrgs: ["AD1", "AO1", "AT1", "AY5", "AZ5", "BES", "CDC", "CHS"],
    });
  };

  const deleteAll = async () => {
    await deleteAllJdi({});
  };

  //   const handleChangePage = (_: unknown, newPage: number) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  const handlePageChange = (_: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  const pageCount = data?.total ? Math.ceil(data.total / rowsPerPage) : 0;

  const handleView = (item: BomResponse["data"][0]) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  return (
    <Container maxWidth="xl">
      <Dialog
        isOpen={open}
        title="BOM Details"
        onCancel={handleClose}
        cancelText="Close"
        disabled={false}
      >
        {selectedItem && (
          <Stack spacing={2} sx={{ paddingY: 2 }}>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Request ID:</strong> {selectedItem.requestID}
            </Typography>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Source Org:</strong> {selectedItem.sourceORG}
            </Typography>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Processed Items:</strong>
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedItem.processedItems.map((p, idx) => (
                <Chip key={idx} label={p.Segment1} sx={{ fontSize: 15 }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Target Orgs:</strong>
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedItem.targetOrgs.map((org, idx) => (
                <Chip key={idx} label={org} sx={{ fontSize: 15 }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Status:</strong>
            </Typography>
            <Box>
              <Chip
                label={selectedItem.status}
                color={getStatusColor(selectedItem.status as Status)}
                sx={{ fontSize: 15 }}
              />
            </Box>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Submitted:</strong>{" "}
              {new Date(selectedItem.timestamp).toLocaleString()}
            </Typography>
          </Stack>
        )}
      </Dialog>

      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          BOM Commoning Status
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => {
              if (!!!objectDetails?.length) dispatch(setIsDropped(false));
              navigate(route.index);
            }}
          >
            Home
          </Button>
        </Stack>

        {false && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={create}
            >
              Create
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={deleteAll}
            >
              Delete All
            </Button>
          </Stack>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <InputLabel sx={{ fontSize: 16 }}>Search BOM</InputLabel>

            <TextField
              // label="Search BOM"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <InputLabel sx={{ fontSize: 16 }}>Status</InputLabel>
            <FormControl fullWidth>
              <Select
                value={statusFilter}
                // label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="In Process">In Process</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <InputLabel sx={{ fontSize: 16 }}>Rows per page</InputLabel>
            <FormControl fullWidth>
              <Select
                value={rowsPerPage}
                // label="Status"
                onChange={(e) => {
                  setRowsPerPage(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <DateRange />

          {false && (
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <InputLabel>Sort</InputLabel>
              <FormControl fullWidth>
                <Select
                  value={sortOrder}
                  // label="Sort"
                  onChange={(e) => {
                    setSortOrder(e.target.value as "ASC" | "DESC");
                    setPage(0);
                  }}
                >
                  <MenuItem value="DESC">Newest</MenuItem>
                  <MenuItem value="ASC">Oldest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <TableContainer
          component={Paper}
          sx={{ maxHeight: 700, overflow: "auto" }}
        >
          <Table size="small">
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                backgroundColor: "background.paper",
                zIndex: 1,
              }}
            >
              <TableRow>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Request ID
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Source Org
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Processed Items
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Target Orgs
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Submitted
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 18, fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!isFetching && !!!data?.data?.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No data found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {isFetching && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}

              {// isFetching ? (
              //   <>
              //     <TableRow>
              //     <TableCell colSpan={7} align="center">
              //       <CircularProgress size={24} />
              //     </TableCell>
              //   </TableRow>
              //   </>
              // ) : data?.data?.length ? (
              data?.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontSize: 15 }}>{item.requestID}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>{item.sourceORG}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {renderChipsWithEllipsis(
                      item.processedItems.map((p) => p.Segment1),
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {renderChipsWithEllipsis(item.targetOrgs)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status as Status)}
                      size="small"
                      sx={{
                        width: 100,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 14,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      // variant="outlined"
                      size="small"
                      onClick={() => handleView(item)}
                      sx={{ fontSize: 14 }}
                    >
                      {/* View */}
                      <RemoveRedEyeIcon sx={{ fontSize: 22 }} />
                    </Button>

                    {false && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => update(item.id)}
                      >
                        Update
                      </Button>
                    )}

                    {/* {item.status === "Failed" && (
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={<RefreshIcon />}
                          >
                            Retry
                          </Button>
                        )} */}
                  </TableCell>
                </TableRow>
              ))
              // ) : (
              //   <TableRow>
              //     <TableCell colSpan={7} align="center">
              //       <Typography variant="body2" color="textSecondary">
              //         No data found.
              //       </Typography>
              //     </TableCell>
              //   </TableRow>
              // )
              }
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>

        {/* <TablePagination
          component="div"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          count={data?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        /> */}
      </Box>
    </Container>
  );
}
