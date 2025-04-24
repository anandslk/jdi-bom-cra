import { FormEvent, useEffect, useState } from "react";
import { TextField, Box, Paper, Button, Stack, Alert } from "@mui/material";
import { ConfirmationScreen } from "src/components/Confirmation";
import { ResultsScreen } from "src/components/Result";
import { Dialog } from "src/components/Dialog";
import { useBomMutation } from "src/slices/apis/jdiBom.api";
import { getErrorMessage } from "src/slices/apis/types";
import { DropdownMultiSelect } from "src/components/DropdownSelect";
import { toast } from "react-toastify";
import {
  initialState,
  setIsDropped,
  setObjectDetails,
  setObjectIds,
} from "src/store/droppedObjectSlice";
import { useAppDispatch, useAppSelector } from "src/store";
import { useJdiBom } from "src/hooks/useJdiBom";
import { orgList } from "src/utils";
import { InjectedDroppableProps } from "src/components/WithDroppable";

export const JdiBomPage: React.FC<JdiBomPageProps> = () => {
  const dispatch = useAppDispatch();

  const { objectDetails } = useAppSelector((state) => state.droppedObject);

  const { classifiedItem } = useJdiBom();
  // const { data: orgList } = useOrgListQuery({});

  // Form fields and error state
  const [errors, setErrors] = useState<Partial<IFormErrors>>({
    parentPart: "",
    sourceOrg: "",
    plants: "",

    rdo: "",
    jdi: "",
  });

  const initialForm = {
    parentPart: objectDetails?.Title,
    sourceOrg: objectDetails?.["Collaborative Space"],
    plants: [],

    rdo: "",
    jdi: "",
  };

  const [formState, setFormState] = useState<IFormState>(initialForm);

  const handleChange = (
    key: keyof IFormState,
    value: IFormState[keyof IFormState]
  ) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));

    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      parentPart: objectDetails?.Title,
      sourceOrg: objectDetails?.["Collaborative Space"],
    }));
  }, [objectDetails]);

  useEffect(() => {
    const rv =
      formState.parentPart && objectDetails?.["Maturity State"] !== "Released";

    setErrors((prev) => ({
      ...prev,
      parentPart: rv
        ? "Part is not in released state, please select another part"
        : "",
    }));
  }, [objectDetails, formState.parentPart]);

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

    if (!formState.parentPart?.trim())
      newErrors.parentPart = "Parent Part is required";

    if (!formState.sourceOrg?.trim())
      newErrors.sourceOrg = "Source org is required";

    if (!formState.rdo?.trim()) newErrors.rdo = "RDO Name is required";
    if (!formState.jdi?.trim()) newErrors.jdi = "JDI is required";

    if (!formState.plants.length)
      newErrors.plants = "Select either RDO Name or Destination JDI Org";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values({ ...errors, ...newErrors }).some(
      (val) => !!val
    );

    if (!hasErrors) setIsOpen(true);
  };

  // --- Cancel Handler ---
  const handleCancel = () => {
    dispatch(setObjectIds(initialState.objectIds));
    dispatch(setObjectDetails(initialState.objectDetails));

    dispatch(setIsDropped(false));
  };

  const [bomMutation, { isLoading }] = useBomMutation();

  // --- Confirmation Stage ---
  const handleConfirmationSubmit = async () => {
    const { data, error } = await bomMutation({
      parentPart: formState.parentPart,
      sourceOrg: formState.sourceOrg,
      plants: formState.plants,
    });

    if (error) return toast.error(getErrorMessage(error));

    setIsOpen(false);
    toast.success(data.message);
    // setTimeout(() => navigate("/tasks"), 500);
  };

  return (
    <>
      <Box
        sx={{ minHeight: "calc(100vh - 65px)", backgroundColor: "#eef2f6" }}
        className="h-screen"
      >
        <Dialog
          isOpen={isOpen}
          title="Confirm Your Submission"
          onSubmit={handleConfirmationSubmit}
          onCancel={() => setIsOpen(false)}
          disabled={isLoading}
        >
          <ConfirmationScreen
            parentPart={formState.parentPart}
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
              maxWidth: 600,
              borderRadius: 4,
              boxShadow: 3,
            }}
          >
            <form noValidate onSubmit={handleFormSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  required
                  disabled
                  label="Parent item(s) to Assign"
                  variant="outlined"
                  value={formState.parentPart}
                  onChange={(e) => handleChange("parentPart", e.target.value)}
                  error={!!errors.parentPart}
                  helperText={errors.parentPart}
                />

                <TextField
                  fullWidth
                  required
                  disabled
                  label="Source Organization"
                  variant="outlined"
                  value={formState.sourceOrg}
                  onChange={(e) => handleChange("sourceOrg", e.target.value)}
                  error={!!errors.sourceOrg}
                  helperText={errors.sourceOrg}
                />

                <DropdownMultiSelect
                  selectedItems={formState.plants}
                  onChangePlants={(newSelectedItems) =>
                    handleChange("plants", newSelectedItems)
                  }
                  handleChange={handleChange}
                  disabled={false}
                  rdoList={classifiedItem?.data!}
                  // jdiList={orgList?.data!}
                  jdiList={orgList!}
                  errors={errors}
                />

                {errors.plants && (
                  <Alert severity="error">{errors.plants}</Alert>
                )}

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
              parentPart={formState.parentPart}
              sourceOrg={formState.sourceOrg}
              selectedItems={formState.plants}
              onBack={() => setIsOpen(false)}
            />
          )}
        </Box>
      </Box>
      {/* </SecureRoute> */}
    </>
  );
};

export default JdiBomPage;

export type IFormState = {
  parentPart: string;
  sourceOrg: string;
  plants: string[];

  rdo: string;
  jdi: string;
};

export interface IFormErrors {
  parentPart?: string;
  sourceOrg?: string;
  plants?: string;

  rdo?: string;
  jdi?: string;
}

export interface JdiBomPageProps extends InjectedDroppableProps<{}> {}
