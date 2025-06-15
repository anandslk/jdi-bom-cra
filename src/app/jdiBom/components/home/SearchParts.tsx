import { TextField } from "@mui/material";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import { IFormErrors, IFormState } from "../../pages";
import { ItemsDialog } from "../Unreleased";

export const SearchParts = ({
  onSearchParts,
  requiredError,
  setErrors,
}: SearchPartsProps) => {
  const {
    inputValue,
    setInputValue,
    handleSearchParts,
    isUnreleased,
    setIsUnreleased,

    items,
    setItems,

    isNotFound,
    setIsNotFound,

    isObsolete,
    setIsObsolete,
  } = useAdvancedSearch();

  useEffect(() => {
    if (onSearchParts) {
      onSearchParts({ handleSearchParts, inputValue });
    }
  }, [onSearchParts, handleSearchParts, inputValue]);

  return (
    <>
      <ItemsDialog
        title="Unreleased Parts"
        description="Some parts are not in Released state and cannot be selected for BOM
        commoning."
        onOpen={isUnreleased}
        onCancel={() => {
          setIsUnreleased(false);
          setItems([]);
        }}
        items={items}
      />

      <ItemsDialog
        title="Obsolete Parts"
        description="The part you selected is in obsolete state. Please search and select a valid part to continue."
        onOpen={isObsolete}
        onCancel={() => setIsObsolete(false)}
        items={["ISV-PARENT", "P-98418"]}
      />

      <ItemsDialog
        title="Part not found"
        description="The part you selected is either incorrect or does not exist. Please search and select a valid part to continue."
        onOpen={isNotFound}
        onCancel={() => setIsNotFound(false)}
        items={items}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={5}
        variant="outlined"
        placeholder="Enter or paste text"
        value={inputValue}
        onChange={(e) => {
          setErrors((prev) => ({ ...prev, parentParts: "" }));
          setInputValue(e.target.value);
        }}
        error={!!requiredError}
        helperText={requiredError}
        sx={{
          minWidth: 200,
          flexGrow: 1,
          marginTop: "5px !important",
        }}
        slotProps={{
          input: { sx: { fontSize: 16 } },
          formHelperText: { sx: { fontSize: 13 } },
        }}
      />

      {/* {!!chips?.length && (
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
      )} */}
    </>
  );
};

export type SearchPartsHandlers = {
  handleSearchParts: () => Promise<IProductInfo[] | null>;
  inputValue: string;
};

type SearchPartsProps = {
  onSearchParts?: (handlers: SearchPartsHandlers) => void;
  formState: IFormState;
  setFormState: Dispatch<SetStateAction<IFormState>>;
  setErrors: Dispatch<SetStateAction<IFormErrors>>;
  requiredError: string;
};
