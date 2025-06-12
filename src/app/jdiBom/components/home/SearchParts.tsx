import { TextField } from "@mui/material";
import { Dispatch, SetStateAction, useEffect } from "react";
import Loader from "src/components/Loader/Loader";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import { IFormErrors, IFormState } from "../../pages";
import { UnreleasedItems } from "../Unreleased";

export const SearchParts = ({
  onSearchParts,
  requiredError,
  setErrors,
}: SearchPartsProps) => {
  const {
    inputValue,
    setInputValue,
    handleInputChange,
    isFetching,
    isUnreleased,
    setIsUnreleased,
    unreleasedItems,
    setUnreleasedItems,
  } = useAdvancedSearch();

  useEffect(() => {
    if (onSearchParts) {
      onSearchParts({ handleInputChange, inputValue });
    }
  }, [onSearchParts, handleInputChange, inputValue]);

  console.log("isUnreleased...........................", isUnreleased);
  console.log("unreleasedItems...........................", unreleasedItems);

  return (
    <>
      {isFetching && <Loader />}

      <UnreleasedItems
        onOpen={isUnreleased}
        onCancel={() => {
          setIsUnreleased(false);
          setUnreleasedItems([]);
        }}
        unreleasedItems={unreleasedItems}
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
  handleInputChange: (
    setFormState: Dispatch<SetStateAction<IFormState>>,
  ) => Promise<{ products: IProductInfo[]; prevr: EngItemResult[] } | null>;
  inputValue: string;
};

type SearchPartsProps = {
  onSearchParts?: (handlers: SearchPartsHandlers) => void;
  formState: any;
  setErrors: Dispatch<SetStateAction<IFormErrors>>;
  requiredError: string;
};
