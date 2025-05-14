import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Alert,
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputLabel,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { ConfirmationScreen } from "src/app/jdiBom/components/Confirmation";
import { Dialog } from "src/app/jdiBom/components/Dialog";
import { DropdownMultiSelect } from "src/app/jdiBom/components/DropdownSelect";
import { ResultsScreen } from "src/app/jdiBom/components/Result";
import { InjectedDroppableProps } from "src/app/jdiBom/hoc/withDroppable";
import {
  removeProduct,
  setIsDropped,
} from "src/app/jdiBom/slices/reducers/jdiBom.reducer";
import { useAppDispatch, useAppSelector } from "src/app/jdiBom/store";
import { availOrgsList, RDO_ORGS, RdoKey, rdoList } from "src/app/jdiBom/utils";
import Loader from "src/components/Loader/Loader";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { Tooltip } from "@mui/material";
import { useJdiBom } from "../hooks/useJdiBom";
import { MultiSelectList } from "../components/MultiSelect";

const JdiBomPage: React.FC<JdiBomPageProps> = () => {
  const dispatch = useAppDispatch();

  const { objectDetails } = useAppSelector((state) => state.jdiBom);

  const { plants } = useJdiBom();

  // Form fields and error state
  const [errors, setErrors] = useState<Partial<IFormErrors>>({
    parentParts: "",
    sourceOrg: "",
    plants: "",

    rdo: "",
    jdi: "",
  });

  const initialForm = {
    parentParts: [],
    sourceOrg: "",
    plants: [],

    rdo: "" as RdoKey,
    jdi: "",
  };

  const [formState, setFormState] = useState<IFormState>(initialForm);

  const [jdiList, setJdiList] = useState<string[]>([]);
  const [availOrgs, setAvailOrgs] = useState<string[]>([]);

  useEffect(() => {
    const selectedRdo = formState.rdo;
    const orgs = selectedRdo ? RDO_ORGS[selectedRdo] || [] : [];

    console.log("orgs....................", orgs);
    setJdiList(orgs);

    // setFormState((fs) => ({
    //   ...fs,
    //   jdi: "",
    //   plants: orgs,
    // }));
    // setFormState((fs) => ({
    //   ...fs,
    //   jdi: "",
    //   plants: fs.plants.filter(
    //     (p) => !Object.values(RDO_ORGS).flat().includes(p) || orgs.includes(p)
    //   ),
    // }));
  }, [formState.rdo]);

  const handleChange = (
    key: keyof IFormState,
    value: IFormState[keyof IFormState],
  ) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));

    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      parentParts: objectDetails,
      // parentParts: objectDetails.filter(
      //   (item) => item["Maturity State"] === "Released"
      // ),
      // sourceOrg: objectDetails?.["Collaborative Space"],
    }));
  }, [objectDetails]);

  // useEffect(() => {
  //   const rv =
  //     formState.parentPart && objectDetails?.["Maturity State"] !== "Released";

  //   setErrors((prev) => ({
  //     ...prev,
  //     parentPart: rv
  //       ? "Part is not in released state, please select another part"
  //       : "",
  //   }));
  // }, [objectDetails, formState.parentPart]);

  useEffect(() => {
    if (formState.rdo?.trim()) {
      setErrors((prev) => ({ ...prev, rdo: "" }));
    }
  }, [formState.rdo]);

  // clear JDI error as soon as there's at least one JDI Org selected
  useEffect(() => {
    if (formState.jdi?.trim()) {
      setErrors((prev) => ({ ...prev, jdi: "" }));
    }
  }, [formState.jdi]);

  const [isOpen, setIsOpen] = useState(false);

  // --- Form Submission ---
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newErrors: IFormErrors = {};

    if (!formState.sourceOrg?.trim())
      newErrors.sourceOrg = "Source org is required";

    if (!formState.rdo?.trim()) newErrors.rdo = "RDO Name is required";
    if (!formState.jdi?.trim()) newErrors.jdi = "JDI is required";

    if (!formState.plants.length)
      newErrors.plants = "Select either RDO Name or Destination JDI Org";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values({ ...errors, ...newErrors }).some(
      (val) => !!val,
    );

    if (!hasErrors) setIsOpen(true);
  };

  // --- Cancel Handler ---
  const handleCancel = () => dispatch(removeProduct());

  // --- Confirmation Stage ---
  const handleConfirmationSubmit = async () => {
    // const { data, error } = await bomMutation({
    //   parentParts: formState.parentParts,
    //   sourceOrg: formState.sourceOrg,
    //   plants: formState.plants,
    // });

    // if (error) return toast.error(getErrorMessage(error));

    setIsOpen(false);
    // toast.success(data.message);
    // setTimeout(() => navigate("/tasks"), 500);
  };

  const handleChangePI = (
    _event: SyntheticEvent<Element, Event>,
    newValue: IProductInfo[],
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<IProductInfo>,
  ) => {
    // const attempted = details?.option;
    // if (
    //   reason === "selectOption" &&
    //   attempted &&
    //   attempted?.["Maturity State"] !== "Released"
    // ) {
    //   return;
    // }

    handleChange("parentParts", newValue);
  };

  if (plants?.isFetching) return <Loader />;
  return (
    <>
      <Container>
        <Box sx={{ minHeight: "calc(100vh - 65px)" }}>
          <Dialog
            isOpen={isOpen}
            title="Confirm Your Submission"
            onSubmit={handleConfirmationSubmit}
            onCancel={() => setIsOpen(false)}
            disabled={false}
          >
            <ConfirmationScreen
              parentParts={formState.parentParts?.map((item) => item.Title)}
              sourceOrg={formState.sourceOrg}
              selectedItems={formState.plants}
            />
          </Dialog>

          <Box
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              minHeight: "calc(100vh - 200px)",
            }}
          >
            <Paper
              sx={{
                padding: 4,
                width: "100%",
                // maxWidth: 600,
                borderRadius: 4,
                boxShadow: 3,
              }}
            >
              <form noValidate onSubmit={handleFormSubmit}>
                <Stack spacing={3}>
                  <InputLabel
                    sx={{
                      fontWeight: "bold",
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Parent item(s) to Assign
                    <AddCircleOutlineIcon
                      sx={{ color: "#1976d2", fontSize: 22, cursor: "pointer" }}
                      onClick={() => dispatch(setIsDropped(false))}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={objectDetails}
                    getOptionLabel={(option) => option.Title}
                    value={formState.parentParts}
                    onChange={handleChangePI}
                    renderOption={(props, option) => (
                      <li {...props} key={option.Title}>
                        <span
                        // style={{
                        //   color:
                        //     option?.["Maturity State"] !== "Released"
                        //       ? "#ccc"
                        //       : "inherit",
                        // }}
                        >
                          {option.Title}
                        </span>
                        <Tooltip
                          title={
                            option["Maturity State"] !== "Released"
                              ? "Part is not in Released state"
                              : ""
                          }
                          slotProps={{ tooltip: { sx: { fontSize: "14px" } } }}
                        >
                          {option["Maturity State"] !== "Released" ? (
                            <ErrorOutlineIcon
                              sx={{
                                color: "red",
                                fontSize: 16,
                                marginLeft: 0.5,
                              }}
                            />
                          ) : (
                            <span></span>
                          )}
                        </Tooltip>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.Title === value.Title
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        variant="outlined"
                        // label="Parent item(s) to Assign"
                        error={!!errors.parentParts}
                        helperText={errors.parentParts}
                      />
                    )}
                    renderValue={(value, getTagProps) => {
                      return (
                        <Box
                          sx={{
                            maxHeight: 100,
                            overflowY: "auto",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            paddingRight: 1,
                          }}
                        >
                          {value.map((option, index) => (
                            <Chip
                              label={option.Title}
                              {...getTagProps({ index })}
                            />
                          ))}
                        </Box>
                      );
                    }}
                    sx={{
                      marginTop: "5px !important",
                      "& .MuiAutocomplete-tag": {
                        maxWidth: "100%",
                      },
                      "& .MuiOutlinedInput-root": {
                        maxHeight: `400px !important`,
                      },
                      "& .MuiAutocomplete-endAdornment": {
                        maxHeight: `400px !important`,
                        alignSelf: "flex-start",
                      },
                    }}
                  />

                  <InputLabel sx={{ fontWeight: "bold", fontSize: 16 }}>
                    Source Orgs
                  </InputLabel>
                  <Autocomplete
                    options={plants?.data ?? []}
                    value={formState.sourceOrg}
                    onChange={(_, value) =>
                      handleChange("sourceOrg", value || "")
                    }
                    // clearOnEscape
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        variant="outlined"
                        // placeholder="Source Orgs"
                        error={!!errors.sourceOrg}
                        helperText={errors.sourceOrg}
                      />
                    )}
                    sx={{ marginTop: "5px !important" }}
                  />

                  <>
                    {/* <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "column", md: "row" },
                    justifyContent: "center",
                    alignItems: "center",
                    height: { md: 200 },
                    gap: 2,
                  }}
                >
                  <Box>
                    // RDO single-select
                    <InputLabel
                      sx={{
                        fontWeight: "bold",
                        fontSize: 16,
                        // marginBottom: "-15px !important",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      JDI RDO List
                      <EditNoteIcon sx={{ color: "#1976d2", fontSize: 22 }} />
                    </InputLabel>
                    <Autocomplete
                      options={rdoList}
                      value={formState.rdo}
                      onChange={(_, newVal) => handleChange("rdo", newVal!)}
                      clearOnEscape
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          // placeholder="JDI RDO List"
                          fullWidth
                          variant="outlined"
                          error={!!errors.rdo}
                          helperText={errors.rdo}
                          // disabled={disabled}
                        />
                      )}
                    />
                  </Box>

                  <ArrowCircleRightIcon
                    onClick={() => {
                      setFormState((fs) => ({
                        ...fs,
                        jdi: "",
                        plants: jdiList,
                      }));
                      setAvailOrgs([]);
                    }}
                  />

                  <>
                    <DropdownMultiSelect
                      selectedItems={formState.plants}
                      onChangePlants={(newSelectedItems) =>
                        handleChange("plants", newSelectedItems)
                      }
                      handleChange={handleChange}
                      disabled={false}
                      rdoList={rdoList}
                      // jdiList={orgList?.data!}
                      jdiList={jdiList}
                      errors={errors}
                    />

                    {errors.plants && (
                      <Alert severity="error">{errors.plants}</Alert>
                    )}
                  </>

                  <>
                    <ArrowCircleLeftIcon
                      onClick={() => {
                        setFormState((fs) => ({
                          ...fs,
                          jdi: "",
                          rdo: "",
                          plants: availOrgs,
                        }));
                      }}
                    />

                    <Box>
                      <InputLabel sx={{ fontWeight: "bold", fontSize: 16 }}>
                        Available Orgs
                      </InputLabel>
                      <Autocomplete
                        multiple
                        renderValue={() => null} // Hides the selected chips
                        options={availOrgsList ?? []}
                        value={availOrgs}
                        onChange={(_, value) => setAvailOrgs(value)}
                        // clearOnEscape
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            fullWidth
                            variant="outlined"
                            // placeholder="Source Orgs"
                            error={!!errors.sourceOrg}
                            helperText={errors.sourceOrg}
                          />
                        )}
                        sx={{ marginTop: "5px !important" }}
                      />
                    </Box>
                  </>
                </Box> */}
                  </>

                  <Box
                    sx={{
                      display: "flex",
                      // flexDirection: { xs: "column", sm: "column", md: "row" },
                      justifyContent: "center",
                      alignItems: "center",
                      height: { md: 300 },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <MultiSelectList
                        title="JDI RDO List"
                        items={rdoList}
                        selected={formState.rdo}
                        onChange={(newVal) =>
                          handleChange("rdo", newVal.target.value!)
                        }
                      />
                    </Box>

                    <IconButton
                      onClick={() => {
                        setFormState((fs) => ({
                          ...fs,
                          jdi: "",
                          plants: jdiList,
                        }));
                        setAvailOrgs([]);
                      }}
                      disabled={!formState.rdo}
                    >
                      <ArrowCircleRightIcon sx={{ fontSize: 25 }} />
                    </IconButton>

                    <Box sx={{ width: "68%" }}>
                      <DropdownMultiSelect
                        selectedItems={formState.plants}
                        onChangePlants={(newSelectedItems) =>
                          handleChange("plants", newSelectedItems)
                        }
                        handleChange={handleChange}
                        disabled={false}
                        rdoList={rdoList}
                        // jdiList={orgList?.data!}
                        jdiList={jdiList}
                        errors={errors}
                      />

                      {errors.plants && (
                        <Alert severity="error">{errors.plants}</Alert>
                      )}
                    </Box>

                    <>
                      <IconButton
                        onClick={() => {
                          setFormState((fs) => ({
                            ...fs,
                            jdi: "",
                            rdo: "",
                            plants: availOrgs,
                          }));
                        }}
                        disabled={!!!availOrgs.length}
                      >
                        <ArrowCircleLeftIcon sx={{ fontSize: 25 }} />
                      </IconButton>

                      <Box>
                        <MultiSelectList
                          multiSelect
                          title="Available Orgs"
                          items={availOrgsList}
                          selected={availOrgs}
                          onChange={setAvailOrgs}
                        />
                      </Box>
                    </>
                  </Box>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button type="submit" variant="contained" color="primary">
                      Submit
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Paper>

            {/* <LoadingScreen message="Assigning items and commoning required parts..." /> */}

            {/* Results Screen */}
            {false && (
              <ResultsScreen
                parentParts={formState.parentParts?.map((item) => item.Title)}
                sourceOrg={formState.sourceOrg}
                selectedItems={formState.plants}
                onBack={() => setIsOpen(false)}
              />
            )}
          </Box>
        </Box>
      </Container>
      {/* </SecureRoute> */}
    </>
  );
};

export default JdiBomPage;

export type IFormState = {
  parentParts: IProductInfo[];
  sourceOrg: string;
  plants: string[];

  rdo: RdoKey;
  jdi: string;
};

export interface IFormErrors {
  parentParts?: string;
  sourceOrg?: string;
  plants?: string;

  rdo?: string;
  jdi?: string;
}

export interface JdiBomPageProps extends InjectedDroppableProps<{}> {}
