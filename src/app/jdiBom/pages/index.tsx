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
  Typography,
} from "@mui/material";
import {
  FC,
  FormEvent,
  Fragment,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { availOrgsList, RDO_ORGS, rdoList } from "src/app/jdiBom/utils";
import Loader from "src/components/Loader/Loader";

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MultiSelectList } from "../components/MultiSelect";
import { Unreleased } from "../components/Unreleased";
import { route } from "../constants";
import { useHandleDrop } from "../hooks/useHandleDrop";
import { useJdiBom } from "../hooks/useJdiBom";
import { IRDO_ORGS, useDestOrgsQuery } from "../slices/apis/destOrgs.api";
import { useCreateJdiBomMutation } from "../slices/apis/jdiBom.api";
import { getErrorMessage } from "../slices/apis/types";
import {
  SearchParts,
  SearchPartsHandlers,
} from "../components/home/SearchParts";
import { useMutation } from "@tanstack/react-query";
import { AddCircleOutline } from "@mui/icons-material";
import { Navbar } from "../components/Navbar";

const orgsData = { data: { ...RDO_ORGS, availOrgs: availOrgsList } };

export const JdiBomPage: FC<JdiBomPageProps> = () => {
  const dispatch = useAppDispatch();

  const { objectDetails } = useAppSelector((state) => state.jdiBom);
  const user = useAppSelector((state) => state.user);

  const navigate = useNavigate();

  const searchPartsRef = useRef<SearchPartsHandlers>(null);

  const { plants, prevRev, engRelease, collabSpace } = useJdiBom();

  // Form fields and error state
  const [errors, setErrors] = useState<IFormErrors>({
    parentParts: "",
    sourceOrg: "",
    plants: "",

    rdo: "",
    jdi: "",
  });

  const initialForm = {
    parentParts: [],
    sourceOrg: "MVO",
    plants: [],

    rdo: "" as RdoKey,
    jdi: "",
  };

  const [formState, setFormState] = useState<IFormState>(initialForm);

  const [jdiList, setJdiList] = useState<string[]>([]);
  const [availOrgs, setAvailOrgs] = useState<string[]>([]);

  const [isConfirm, setIsConfirm] = useState(false);

  const initialGenerated = {
    open: false,
    data: {
      id: "",
      status: "",
      submittedBy: "",
    },
  };

  const [generated, setGenerated] = useState(initialGenerated);

  useHandleDrop();

  const { data = orgsData, isFetching: isOrgs } = useDestOrgsQuery({});

  const mutateParts = useMutation({
    mutationFn: async () => {
      const res = await searchPartsRef.current?.handleSearchParts?.();

      setFormState((prev) => ({ ...prev, parentParts: res! }));

      return res;
    },

    onSuccess: () => setIsConfirm(true),
  });

  useEffect(() => {
    if (!data?.data) return;

    // const selectedRdo = formState.rdo as any;
    // const orgs = selectedRdo ? (data?.data)[selectedRdo] || [] : [];

    const orgs =
      formState.rdo && data?.data && formState.rdo in data.data
        ? data.data[formState.rdo as RdoKey]
        : [];

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
  }, [formState.rdo, data?.data]);

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
      parentParts: objectDetails.filter(
        (item) => item["Maturity State"]?.toLowerCase() === "released",
      ),
    }));
  }, [objectDetails]);

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

  useEffect(() => {
    if (!collabSpace.data || !formState.sourceOrg) return;

    const isOrgPresent = collabSpace.data?.collabspaces?.some((cs) =>
      cs?.couples?.some(
        (couple) => couple?.organization?.title === formState.sourceOrg,
      ),
    );

    console.info("Is source org present in collabspaces:", isOrgPresent);

    // if (!isOrgPresent) {
    //   setErrors((prev) => ({
    //     ...prev,
    //     sourceOrg: "Source org is not present in the collaborative spaces",
    //   }));
    // } else {
    //   setErrors((prev) => ({ ...prev, sourceOrg: "" }));
    // }
  }, [collabSpace.data, formState.sourceOrg]);

  // --- Form Submission ---
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Partial<IFormErrors> = {};

    if (!!objectDetails?.length) {
      if (!!!formState.parentParts.length)
        newErrors.parentParts = "Minimum 1 part is required";
    } else {
      if (!searchPartsRef?.current?.inputValue) {
        newErrors.parentParts = "Minimum 1 part is required";
      }
    }

    if (!formState.sourceOrg?.trim())
      newErrors.sourceOrg = "Source org is required";

    // if (!formState.rdo?.trim()) newErrors.rdo = "RDO Name is required";
    // if (!formState.jdi?.trim()) newErrors.jdi = "JDI is required";

    if (!formState.plants.length)
      newErrors.plants = "Select either JDI RDO or Available Orgs";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values({ ...errors, ...newErrors }).some(
      (val) => !!val,
    );

    if (!hasErrors) {
      if (!!!objectDetails?.length) mutateParts.mutate();
      else setIsConfirm(true);
    }
  };

  // --- Cancel Handler ---
  const handleCancel = () => dispatch(removeProduct());

  const [createBom, { isLoading }] = useCreateJdiBomMutation();

  // --- Confirmation Stage ---
  const handleConfirmationSubmit = async () => {
    const payload = {
      sourceOrg: formState.sourceOrg,
      processedItems: formState.parentParts,
      targetOrgs: formState.plants,
    };

    setIsConfirm(false);

    const { error, data } = await createBom({
      ...payload,
      userEmail: user.email,
    });

    if (error) return toast.error(getErrorMessage(error));

    toast.success(data.message);

    setGenerated({
      open: true,
      data: {
        id: data?.data?.id,
        status: data?.data?.status,
        submittedBy: data?.data?.userEmail,
      },
    });
  };

  const handleChangePI = (
    _event: SyntheticEvent<Element, Event>,
    newValue: IProductInfo[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<IProductInfo>,
  ) => {
    const attempted = details?.option;
    if (
      reason === "selectOption" &&
      attempted &&
      attempted?.["Maturity State"]?.toLowerCase() !== "released"
    ) {
      return;
    }

    handleChange("parentParts", newValue);
  };

  const isProcessed =
    plants.isFetching ||
    prevRev.isFetching ||
    engRelease.isFetching ||
    isLoading ||
    mutateParts.isPending ||
    isOrgs;

  const PartSearchIcon = !!objectDetails.length
    ? AddCircleOutline
    : ManageSearchIcon;

  return (
    <>
      <>
        <Dialog
          isOpen={isConfirm}
          title="Confirm Your Submission"
          onSubmit={handleConfirmationSubmit}
          onCancel={() => setIsConfirm(false)}
          disabled={false}
        >
          <ConfirmationScreen
            parentParts={formState.parentParts?.map((item) => item.Title)}
            sourceOrg={formState.sourceOrg}
            selectedItems={formState.parentParts?.map((item) => item.Title)}
          />
        </Dialog>

        <Dialog
          isOpen={generated.open}
          title="Request ID Generated"
          cancelText="Go Back"
          submitText="Check Statuses"
          onCancel={() => {
            setGenerated(initialGenerated);
          }}
          onSubmit={() => {
            setGenerated(initialGenerated);
            navigate(route.status);
          }}
        >
          <Typography variant="body1">
            <strong>Request ID:</strong> {"REQ-91899497"}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Status:</strong> {"Initiated"}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Submitted By:</strong> {"anand.kumar@emerson.com"}
          </Typography>
        </Dialog>

        {isProcessed && <Loader />}
        {!isProcessed && <Unreleased />}
      </>

      <Box
        sx={{
          height: "calc(100vh - 8px)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <Container maxWidth="lg" sx={{ padding: { sm: 0 } }}>
          <Box
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Paper
              sx={{
                padding: 4,
                width: "100%",
                borderRadius: 4,
                boxShadow: 3,
              }}
            >
              <Navbar />

              <form noValidate onSubmit={handleFormSubmit}>
                <Stack spacing={3}>
                  <>
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
                      <Tooltip
                        title={"Search for parts to assign"}
                        arrow
                        slotProps={{ tooltip: { sx: { fontSize: "14px" } } }}
                      >
                        <PartSearchIcon
                          sx={{
                            color: "#1976d2",
                            fontSize: 26,
                            cursor: "pointer",
                          }}
                          onClick={() => dispatch(setIsDropped(false))}
                        />
                      </Tooltip>
                    </InputLabel>

                    {!!objectDetails?.length ? (
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
                              style={{
                                color:
                                  option?.["Maturity State"]?.toLowerCase() !==
                                  "released"
                                    ? "#6c757d"
                                    : "inherit",
                              }}
                            >
                              {option.Title}
                            </span>
                            <Tooltip
                              title={
                                option["Maturity State"]?.toLowerCase() !==
                                "released"
                                  ? "Part is not in Released state"
                                  : ""
                              }
                              slotProps={{
                                tooltip: { sx: { fontSize: "14px" } },
                              }}
                            >
                              {option["Maturity State"]?.toLowerCase() !==
                              "released" ? (
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
                            placeholder="Searched Parts will Appear Here"
                            error={!!errors.parentParts}
                            helperText={errors.parentParts}
                            sx={{ ".MuiInputBase-input": { fontSize: 16 } }}
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
                                <Fragment key={index}>
                                  <Chip
                                    label={option.Title}
                                    {...getTagProps({ index })}
                                    sx={{ fontSize: 15 }}
                                  />
                                </Fragment>
                              ))}
                            </Box>
                          );
                        }}
                        sx={{
                          marginTop: "5px !important",

                          // "& .MuiOutlinedInput-notchedOutline": {
                          //   borderTop: "0 !important",
                          //   borderTopLeftRadius: "0 !important",
                          //   borderTopRightRadius: "0 !important",
                          // },

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
                        slotProps={{
                          paper: {
                            sx: {
                              "& .MuiAutocomplete-option": {
                                fontSize: 16,
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <SearchParts
                        onSearchParts={(fns: SearchPartsHandlers) => {
                          searchPartsRef.current = fns;
                        }}
                        formState={formState}
                        requiredError={errors?.parentParts!}
                        setErrors={setErrors}
                        setFormState={setFormState}
                      />
                    )}
                  </>

                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "nowrap",
                        alignItems: "center",
                        height: { md: 300 },
                        gap: 1,
                        marginTop: {
                          xs: "15px !important",
                          md: "0 !important",
                        },
                        overflowX: "auto",
                        width: "100%",
                      }}
                    >
                      <>
                        <Box sx={{ flexShrink: 0, width: 150 }}>
                          <MultiSelectList
                            title="JDI RDO List"
                            // items={Object.keys(data?.data ?? {})?.filter(
                            //   (item) => item !== "availOrgs"
                            // )}
                            items={Object.keys(
                              data?.data ?? { ...RDO_ORGS },
                            )?.filter((item) => item !== "availOrgs")}
                            selected={formState.rdo}
                            onChange={(newVal) =>
                              handleChange("rdo", newVal.target.value)
                            }
                          />
                        </Box>

                        <IconButton
                          onClick={() => {
                            handleChange("jdi", "");
                            handleChange("plants", jdiList);
                            setAvailOrgs([]);
                          }}
                          disabled={!formState.rdo}
                        >
                          <ArrowCircleRightIcon sx={{ fontSize: 25 }} />
                        </IconButton>
                      </>

                      <Box sx={{ width: "68%" }}>
                        <DropdownMultiSelect
                          selectedItems={formState.plants}
                          onChangePlants={(newSelectedItems) =>
                            handleChange("plants", newSelectedItems)
                          }
                          handleChange={handleChange}
                          disabled={false}
                          rdoList={rdoList}
                          jdiList={jdiList}
                          errors={errors}
                        />
                      </Box>

                      <>
                        <IconButton
                          onClick={() => {
                            handleChange("jdi", "");
                            handleChange("rdo", "");
                            handleChange("plants", availOrgs);
                          }}
                          disabled={!!!availOrgs.length}
                        >
                          <ArrowCircleLeftIcon sx={{ fontSize: 25 }} />
                        </IconButton>

                        <Box>
                          <MultiSelectList
                            multiSelect
                            title="Available Orgs"
                            // items={data?.data.availOrgs ?? []}
                            items={data?.data.availOrgs ?? []}
                            selected={availOrgs}
                            onChange={setAvailOrgs}
                          />
                        </Box>
                      </>
                    </Box>

                    {errors.plants && (
                      <Alert
                        severity="error"
                        sx={{
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          marginTop: {
                            xs: "10px !important",
                            md: "-25px !important",
                          },
                          marginX: "auto !important",
                          width: { xs: "100%", md: "50%" },
                        }}
                      >
                        {errors.plants}
                      </Alert>
                    )}
                  </>

                  <>
                    <InputLabel
                      sx={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginTop: `0 !important`,
                      }}
                    >
                      Source Orgs
                    </InputLabel>
                    <Autocomplete
                      options={plants?.data ?? []}
                      value={formState.sourceOrg}
                      onChange={(_, value) =>
                        handleChange("sourceOrg", value ?? "")
                      }
                      // clearOnEscape
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          fullWidth
                          variant="outlined"
                          placeholder="Source Orgs"
                          error={!!errors.sourceOrg}
                          helperText={errors.sourceOrg}
                          slotProps={{
                            formHelperText: { sx: { fontSize: 14 } },
                          }}
                          sx={{ ".MuiInputBase-input": { fontSize: 16 } }}
                        />
                      )}
                      sx={{ marginTop: "5px !important" }}
                      slotProps={{
                        paper: {
                          sx: {
                            "& .MuiAutocomplete-option": {
                              fontSize: 16,
                            },
                          },
                        },
                      }}
                    />
                  </>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ fontSize: 14 }}
                    >
                      Submit
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                      sx={{ fontSize: 14 }}
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
                onBack={() => setIsConfirm(false)}
              />
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default JdiBomPage;

export type IFormState = {
  parentParts: IProductInfo[];
  sourceOrg: string;
  plants: string[];

  rdo: RdoKey | "";
  jdi: string;
};

export interface IFormErrors {
  parentParts?: string;
  sourceOrg?: string;
  plants?: string;

  rdo: string;
  jdi?: string;
}

export interface JdiBomPageProps extends InjectedDroppableProps<{}> {}

type RdoKey = keyof Omit<IRDO_ORGS, "availOrgs">;
