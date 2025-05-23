import React, {
  useState,
  KeyboardEvent,
  ClipboardEvent,
  ReactNode,
} from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Typography,
  Chip,
  Divider,
  Container,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import TableChartIcon from "@mui/icons-material/TableChart";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import { useMutation } from "@tanstack/react-query";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { env } from "../env";
import { useHandleDrop } from "../hooks/useHandleDrop";
import Loader from "src/components/Loader/Loader";
import { Login } from "@mui/icons-material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export const AdvancedSearch: React.FC<{
  advSearchBtn: ReactNode;
}> = ({ advSearchBtn }) => {
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("list");

  const { fetchWithAuth } = useFetchWithAuth();
  const { handleDrop, isFetching } = useHandleDrop();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const extractAttribute = (result: SearchResult, attrName: string): string => {
    const attr = result?.attributes?.find((a) => a.name === attrName);
    return attr ? (Array.isArray(attr.value) ? attr.value[0] : attr.value) : "";
  };

  const processResults = (data: MutationData): ISelectedItem[] => {
    return data?.results?.map((result) => ({
      label: extractAttribute(result, "ds6w:label"),
      objectId: extractAttribute(result, "resourceid"),
      objectType: extractAttribute(result, "ds6w:what/ds6w:type"),
      description: extractAttribute(result, "ds6w:description"),
      revision: extractAttribute(result, "ds6wg:revision"),
      status: extractAttribute(result, "ds6w:what/ds6w:status"),
      identifier: extractAttribute(result, "ds6w:identifier"),
      created: extractAttribute(result, "ds6w:when/ds6w:created"), //ds6w:who/ds6w:responsible
    }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const url = env.ADVANCED_SEARCH!;

      const partNumberQuery = chips
        ?.map((pn) => `[ds6wg:EnterpriseExtension.V_PartNumber]:"${pn}"`)
        .join(" OR ");

      const fullQuery = `flattenedtaxonomies:"types/VPMReference" AND flattenedtaxonomies:"interfaces/EnterpriseExtension" AND ( ${partNumberQuery} )`;

      const res = await fetchWithAuth({
        customUrl: url,
        method: "POST",
        headers: {},
        body: {
          specific_source_parameter: {
            "3dspace": {
              additional_query:
                ' AND NOT (owner:"ENOVIA_CLOUD" OR owner:"Service Creator" OR owner:"Corporate" OR owner:"User Agent" OR owner:"SLMInstallerAdmin" OR owner:"Creator" OR owner:"VPLMAdminUser")',
            },
          },
          with_indexing_date: true,
          with_synthesis: true,
          with_nls: false,
          label: "3DSearch-e1331143-AdvancedSearch-1747843671676",
          locale: "en",
          select_predicate: [
            "ds6w:label",
            "ds6w:type",
            "ds6w:description",
            "ds6w:identifier",
            "ds6w:modified",
            "ds6w:created",
            "ds6wg:revision",
            "ds6w:status",
            "ds6w:responsible",
            "owner",
            "ds6w:responsibleUid",
            "ds6wg:filesize",
            "ds6w:i3dx",
            "ds6w:project",
            "ds6w:dataSource",
            "ds6w:community",
            "ds6w:originator",
            "dsgeo:referential",
            "ds6w:lastModifiedBy",
            "ds6w:repository",
            "dcterms:title",
            "dcterms:description",
          ],
          with_synthesis_hierarchical: true,
          select_file: ["icon", "thumbnail_2d"],
          query: fullQuery, // use dynamic query here
          refine: {},
          select_exclude_synthesis: ["ds6w:what/ds6w:topic"],
          order_by: "desc",
          order_field: "relevance",
          select_snippets: [
            "ds6w:snippet",
            "ds6w:label:snippet",
            "ds6w:responsible:snippet",
            "ds6w:community:snippet",
            "swym:message_text:snippet",
          ],
          nresults: 40,
          start: "0",
          source: ["3dspace"],
          tenant: "OI000186152",
          login: {
            "3dspace": {
              SecurityContext: "VPLMProjectLeader.Company Name.Common Space",
            },
          },
        },
      });

      return res as MutationData;
    },
  });

  const results = mutation.data ? processResults(mutation.data) : [];
  const resultCount = mutation.data?.infos.nresults || 0;

  // Existing handlers remain the same, just update the state management

  const splitTerms = (text: string) =>
    text
      ?.split(/[,\s\n\r]+/)
      ?.map((s) => s?.trim())
      ?.filter(Boolean);

  const addChips = (values: string[]) => {
    setChips((prev) => {
      const newOnes = values?.filter((v) => v && !prev.includes(v));
      return [...prev, ...newOnes];
    });
  };

  const handleInputChange = () => {
    if (inputValue) {
      addChips(splitTerms(inputValue));
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      handleInputChange();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const terms = splitTerms(paste);
    if (terms?.length) {
      addChips(terms);
    }
  };

  const handleDeleteChip = (chipToDelete: string) => {
    setChips((prev) => prev?.filter((c) => c !== chipToDelete));
  };

  const handleSearchClick = async () => {
    mutation.mutate();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === results?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results?.map((r) => r.objectId)));
    }
  };

  const handleSubmit = async () => {
    const items = results?.filter((r) => selectedIds.has(r.objectId));

    await handleDrop(
      items?.map((item) => ({
        objectId: item?.objectId,
        objectType: item?.objectType,
      })),
    );
  };

  const renderGridItem = (item: ISelectedItem) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item?.objectId}>
      <Paper
        variant="outlined"
        onClick={() => toggleSelect(item?.objectId)}
        sx={{
          p: 2,
          borderColor: selectedIds.has(item?.objectId)
            ? "primary.main"
            : undefined,
          cursor: "pointer",
          width: 300,
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          gap={1}
          sx={{ width: "100%" }}
        >
          {/* <Checkbox checked={selectedIds.has(item?.objectId)} /> */}

          <Checkbox
            checked={selectedIds.has(item?.objectId)}
            icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
            checkedIcon={<CheckBoxIcon fontSize="medium" />}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontSize: 15 }}>
              {item?.label}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {item?.description}
            </Typography>

            <Box mt={1} sx={{ display: "flex" }}>
              <Chip
                label={`Rev: ${item?.revision}`}
                size="small"
                sx={{ fontSize: 14 }}
              />

              <Chip
                label={`Status: ${item?.status?.split(".")?.pop()}`}
                size="small"
                sx={{ ml: 1, fontSize: 14 }}
              />
            </Box>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              Created: {new Date(item?.created).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  const renderListItem = (item: ISelectedItem) => (
    <ListItem key={item?.objectId} disablePadding>
      <ListItemButton
        onClick={() => toggleSelect(item?.objectId)}
        sx={{ display: "flex", alignItems: "flex-start" }}
      >
        <ListItemIcon>
          {/* <Checkbox
            checked={selectedIds.has(item?.objectId)}
            sx={{ transform: "scale(1)" }}
          /> */}

          <Checkbox
            checked={selectedIds.has(item?.objectId)}
            icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
            checkedIcon={<CheckBoxIcon fontSize="medium" />}
          />
        </ListItemIcon>
        <ListItemText
          primary={item?.label}
          slotProps={{
            primary: { sx: { fontSize: 16, fontWeight: "bold" } },
            secondary: { sx: { fontSize: 14 } },
          }}
          secondary={
            <>
              {item?.description}
              <br />
              Revision: {item?.revision} | Status:{" "}
              {item?.status?.split(".")?.pop()}
              <br />
              Created: {new Date(item?.created).toLocaleDateString()}
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );

  const renderTableRow = () => (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box p={2}>
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                {/* <Checkbox
                            checked={
                              selectedIds.size > 0 && results?.length > 0
                                ? selectedIds.size === results?.length
                                : false
                            }
                            sx={{ transform: "scale(1)" }}
                            onChange={handleSelectAll}
                          /> */}

                <Checkbox
                  checked={
                    selectedIds.size > 0 && results?.length > 0
                      ? selectedIds.size === results?.length
                      : false
                  }
                  onChange={handleSelectAll}
                  icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                  checkedIcon={<CheckBoxIcon fontSize="medium" />}
                />
              </Box>
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                Object ID
              </Box>
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                Description
              </Box>
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                Revision
              </Box>
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                Status
              </Box>
              <Box
                component="th"
                sx={{
                  fontSize: 16,
                  textAlign: "start",
                  fontWeight: "bold",
                }}
              >
                Created
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {results?.map((item) => (
              <Box
                component="tr"
                key={item?.objectId}
                onClick={() => toggleSelect(item?.objectId)}
                sx={{ cursor: "pointer" }}
              >
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {/* <Checkbox
                    checked={selectedIds.has(item?.objectId)}
                    sx={{ transform: "scale(1)" }}
                  /> */}

                  <Checkbox
                    checked={selectedIds.has(item?.objectId)}
                    icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
                    checkedIcon={<CheckBoxIcon fontSize="medium" />}
                  />
                </Box>
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {item?.label}
                </Box>
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {item?.description}
                </Box>
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {item?.revision}
                </Box>
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {item?.status?.split(".")?.pop()}
                </Box>
                <Box component="td" sx={{ fontSize: 15, textAlign: "start" }}>
                  {new Date(item?.created).toLocaleDateString()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <>
      {/* <Box
      mt={2}
      sx={{
        // height: "calc(100vh - 63px)",
        // overflow: "auto",
        // width: "100%",
      }}
    > */}
      <Container maxWidth="lg">
        <Box
          p={2}
          sx={{
            height: "calc(100vh - 90px)",
            overflow: "auto",
            width: "100%",

            // maxHeight: "100vh",
            // overflow: "hidden",
            // overflowY: "hidden",
            // display: "flex",
            // flexDirection: "column",
            // width: "100%",
          }}
        >
          {/* Search Section remains the same */}
          {isFetching && <Loader />}

          {/* Top Section: Search */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              // position: "sticky",
              // top: 0,
              backgroundColor: "white",
              // zIndex: 1,
              width: "100%",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <TextField
                variant="standard"
                placeholder="Enter or paste text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                sx={{ minWidth: 200, flexGrow: 1 }}
                slotProps={{ input: { sx: { fontSize: 16 } } }}
              />

              <Button variant="outlined" onClick={handleInputChange}>
                <Login sx={{ fontSize: 25 }} />
              </Button>
            </Box>

            <Box mt={1} sx={{ maxHeight: 100, overflowY: "auto" }}>
              {chips?.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  onDelete={() => handleDeleteChip(chip)}
                  sx={{ mr: 1, mb: 1, fontSize: 14 }}
                />
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 1,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSearchClick}
                disabled={mutation.isPending || chips?.length === 0}
                sx={{ width: 120 }}
              >
                <SearchIcon sx={{ fontSize: 28 }} />
              </Button>
            </Box>
          </Paper>

          {/* Results Section */}
          <Box sx={{ flex: 1, pr: 1, width: "100%" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
              sx={{ width: "100%" }}
            >
              <Typography variant="subtitle1" sx={{ fontSize: 16 }}>
                Results ({mutation.isPending ? "..." : resultCount})
                {mutation.isPending && (
                  <CircularProgress size={20} sx={{ ml: 2 }} />
                )}
              </Typography>

              {/* View Toggle remains the same */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {results?.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<SelectAllIcon sx={{ fontSize: 14 }} />}
                    onClick={handleSelectAll}
                    sx={{ fontSize: 14 }}
                  >
                    {selectedIds.size === results?.length
                      ? "Unselect All"
                      : "Select All"}
                  </Button>
                )}

                {!isMobile && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                  >
                    <ToggleButton value="grid">
                      <ViewModuleIcon sx={{ fontSize: 23 }} />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ViewListIcon sx={{ fontSize: 23 }} />
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableChartIcon sx={{ fontSize: 23 }} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Box>
            </Box>

            {mutation.error && (
              <Typography color="error" sx={{ p: 2 }}>
                Error fetching results: {mutation.error?.message}
              </Typography>
            )}

            <Box
              sx={{
                width: "100%",
                // maxHeight: "calc(100vh - 510px)",
                // overflow: "auto",
              }}
            >
              {viewMode === "grid" && (
                <Grid container spacing={2}>
                  {results?.map(renderGridItem)}
                </Grid>
              )}

              {viewMode === "list" && (
                <List sx={{ width: "100%" }}>
                  {results?.map(renderListItem)}
                </List>
              )}

              {viewMode === "table" && renderTableRow()}
            </Box>

            {/* Submit Section remains the same */}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="flex-end" gap={1}>
          {advSearchBtn}

          <Button
            variant="contained"
            color="primary"
            disabled={!selectedIds.size}
            onClick={handleSubmit}
            sx={{ fontSize: 15 }}
          >
            Submit
          </Button>
        </Box>
      </Container>
      {/* </Box> */}
    </>
  );
};

interface SearchResult {
  attributes: Array<{
    name: string;
    value: string | string[];
    type?: string;
    format?: string;
  }>;
}

interface MutationData {
  results: SearchResult[];
  infos: {
    nresults: number;
  };
}

export interface ISelectedItem {
  label: string;
  objectId: string;
  objectType: string;
  description: string;
  revision: string;
  status: string;
  identifier: string;
  created: string;
}
