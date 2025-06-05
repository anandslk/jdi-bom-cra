import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
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
import { ChangeEvent, useEffect, useMemo, useState } from "react";
// import RefreshIcon from "@mui/icons-material/Refresh";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

import HomeIcon from "@mui/icons-material/Home";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";
import Loader from "src/components/Loader/Loader";
import DateRange, { IFilterAtom } from "../../components/DateRange";
import { Dialog } from "../../components/Dialog";
import { route } from "../../constants";
import {
  BomResponse,
  useCreateJdiBomMutation,
  useDeleteAllMutation,
  useJdiBomsQuery,
  useUpdateJdiBomMutation,
} from "../../slices/apis/jdiBom.api";
import { setIsDropped } from "../../slices/reducers/jdiBom.reducer";
import { useAppDispatch, useAppSelector } from "../../store";

export type Status = "In Process" | "Processing" | "Completed" | "Failed";

export const getStatusColor = (status: Status) => {
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
  const userId = useAppSelector((state) => state.user?.id);

  const [searchInput, setSearchInput] = useState<string>("");

  const [filters, setFilters] = useState<IFilterAtom>({
    search: "",
    page: 0,
    rowsPerPage: 10,
    status: "All",
    sortOrder: "DESC",
    startDate: null,
    endDate: null,
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const objectDetails = useAppSelector((state) => state.jdiBom.objectDetails);

  const { data, isFetching } = useJdiBomsQuery({
    userId,
    search: filters.search,
    status: filters.status,
    sortOrder: filters.sortOrder,
    pageNumber: filters.page + 1,
    pageSize: filters.rowsPerPage,
    ...(filters?.startDate && {
      timestampFrom: filters.startDate,
      timestampTo: filters.endDate,
    }),
  }) as { data?: BomResponse; isFetching: boolean };

  const [_mutate] = useCreateJdiBomMutation();
  const [deleteAllJdi] = useDeleteAllMutation();
  const [updateJdi] = useUpdateJdiBomMutation();

  const [selectedItem, setSelectedItem] = useState<
    BomResponse["data"][0] | null
  >(null);
  const [open, setOpen] = useState(false);

  const handleFilters = (key: keyof IFilterAtom, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateFilterAndResetPage = (
    key: keyof IFilterAtom,
    value: string | number,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  };

  const create = async () => {
    // await mutate({
    //   status: "Completed",
    //   sourceOrg: "MVO",
    //   userId: "1743650926892",
    //   userEmail: "anand@em.com",
    //   processedItems: [
    //     "ISV-823741278",
    //     "ISV-TEST-00889",
    //     "MMI-100",
    //     "ISV-TEST-0101",
    //     "ISV-0001234",
    //     "ISV-PARENT",
    //   ],
    //   targetOrgs: ["AD1", "AO1", "AT1", "AY5", "AZ5", "BES", "CDC", "CHS"],
    // });
  };

  const update = async (id: string) => {
    await updateJdi({
      id,
      updates: {
        // status: "Failed",
        // status: "Completed",
        // sourceOrg: "MMB",
        // // userId: "1743650926892",
        // userEmail: "anand.kumar@emerson.com",
        // processedItems: [
        //   "ISV-823741278",
        //   "ISV-TEST-00889",
        //   "MMI-100",
        //   "ISV-TEST-0101",
        //   "ISV-0001234",
        //   "ISV-PARENT",
        // ],
        // processedItems: [
        //   { Segment1:
        // "ISV-823741278" ,
        // },
        //   { Segment1:
        // "ISV-TEST-00889" ,
        // },
        //   { Segment1:
        // "MMI-100" ,
        // },
        //   { Segment1:
        // "ISV-TEST-0101" ,
        // },
        //   { Segment1:
        // "ISV-0001234" ,
        // },
        //   { Segment1:
        // "ISV-PARENT" ,
        // },
        // ],
        // targetOrgs: ["CDC", "CHS","AD1", "AO1", "AT1", "AY5", "AZ5", "BES", ],
      },
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
    handleFilters("page", newPage - 1);
  };

  const pageCount = data?.total
    ? Math.ceil(data.total / filters.rowsPerPage)
    : 0;

  const handleView = (item: BomResponse["data"][0]) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        updateFilterAndResetPage("search", value);
      }, 500),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
              <strong>Request ID:</strong> {selectedItem.id}
            </Typography>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Source Org:</strong> {selectedItem.sourceOrg}
            </Typography>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Processed Items:</strong>
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedItem.processedItems.map((p, idx) => (
                <Chip key={idx} label={p.Title} sx={{ fontSize: 15 }} />
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
              <strong>Submitted At:</strong>{" "}
              {/* {new Date(selectedItem.timestamp).toLocaleString()} */}
              {new Date(selectedItem.timestamp).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Typography>
            <Typography sx={{ fontSize: 18 }}>
              <strong>Submitted By:</strong>{" "}
              {/* {new Date(selectedItem.timestamp).toLocaleString()} */}
              {selectedItem.userEmail}
            </Typography>
          </Stack>
        )}
      </Dialog>

      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (!!!objectDetails?.length) dispatch(setIsDropped(false));
              navigate(route.index);
            }}
            sx={{
              fontSize: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <HomeIcon sx={{ fontSize: 26 }} />
            {/* Home */}
          </Button>

          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", margin: 0 }}
          >
            BOM Commoning Status
          </Typography>
        </Box>

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

        <Grid container spacing={2} sx={{ my: 2 }}>
          <Box sx={{ width: { xs: "100%", sm: 300 } }}>
            <InputLabel sx={{ fontSize: 16 }}>Search BOM</InputLabel>

            <TextField
              variant="outlined"
              fullWidth
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                debouncedSearch(val);
              }}
              slotProps={{ input: { style: { fontSize: 16 } } }}
            />
          </Box>

          <Box sx={{ width: 100 }}>
            <InputLabel sx={{ fontSize: 16 }}>Status</InputLabel>
            <FormControl fullWidth>
              <Select
                value={filters.status}
                // label="Status"
                onChange={(e) =>
                  updateFilterAndResetPage("status", e.target.value)
                }
                sx={{ fontSize: 16 }}
              >
                <MenuItem sx={{ fontSize: 16 }} value="All">
                  All
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value="In Process">
                  In Process
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value="Completed">
                  Completed
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value="Failed">
                  Failed
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DateRange filters={filters} handleFilters={handleFilters} />

          {false && (
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <InputLabel>Sort</InputLabel>
              <FormControl fullWidth>
                <Select
                  value={filters.sortOrder}
                  // label="Sort"
                  onChange={(e) =>
                    updateFilterAndResetPage("sortOrder", e.target.value)
                  }
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
          sx={{ maxHeight: "calc(100vh - 268px)", overflow: "auto" }}
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
                  Submitted At
                </TableCell>
                <TableCell sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Submitted By
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
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 18 }}
                    >
                      No data found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {isFetching && (
                <>
                  {/* <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow> */}
                  <Loader />
                </>
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
                  <TableCell sx={{ fontSize: 15 }}>{item.id}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>{item.sourceOrg}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {renderChipsWithEllipsis(
                      item.processedItems.map((p) => p.Title),
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
                    {/* {new Date(item.timestamp).toLocaleString()} */}
                    {new Date(item.timestamp).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>{item.userEmail}</TableCell>
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            py: 2,
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InputLabel sx={{ fontSize: 16 }}>Rows per page</InputLabel>
            <FormControl>
              <Select
                value={filters.rowsPerPage}
                // label="Status"
                onChange={(e) =>
                  updateFilterAndResetPage("rowsPerPage", e.target.value)
                }
                sx={{ fontSize: 16, height: 30 }}
              >
                <MenuItem sx={{ fontSize: 16 }} value={5}>
                  5
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value={10}>
                  10
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value={25}>
                  25
                </MenuItem>
                <MenuItem sx={{ fontSize: 16 }} value={100}>
                  100
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Pagination
            count={pageCount}
            page={filters.page + 1}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: 17,
                width: 35,
                height: 35,
                borderRadius: 10,
              },
              "& .MuiSvgIcon-root": {
                fontSize: 22,
              },
            }}
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
