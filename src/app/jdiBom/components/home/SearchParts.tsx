import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import Loader from "src/components/Loader/Loader";
import { useAppSelector } from "../../store";

export const SearchParts = ({ onSearchParts, formState }: SearchPartsProps) => {
  const { objectDetails } = useAppSelector((state) => state.jdiBom);

  const {
    // chips,
    inputValue,
    setInputValue,
    // handleDeleteChip,
    handleInputChange,
    isFetching,
  } = useAdvancedSearch();

  useEffect(() => {
    if (onSearchParts) {
      onSearchParts({ handleInputChange });
    }
  }, [onSearchParts]);

  useEffect(() => {
    if (objectDetails?.length === 0) return setInputValue("");

    const partsTitles = objectDetails?.map((part) => part.Title) || [];

    setInputValue(partsTitles.join("\n"));
  }, [objectDetails]);

  useEffect(() => {
    if (formState?.parentParts) {
      setInputValue(
        formState.parentParts?.map((part: any) => part.Title).join("\n"),
      );
    }
  }, [formState?.parentParts]);

  return (
    <>
      {isFetching && <Loader />}

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={5}
        variant="outlined"
        placeholder="Enter or paste text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={async (e) => {
          //   if (e.key === "Enter" || e.key === ",") {
          if (e.key === "Enter" && e.ctrlKey) {
            // e.preventDefault();
            await handleInputChange();
          }
        }}
        helperText="Press Ctrl + Enter to search"
        // onPaste={handlePaste}
        sx={{
          minWidth: 200,
          flexGrow: 1,
          marginTop: "5px !important",

          //   "& .MuiOutlinedInput-notchedOutline": {
          //       borderBottom: "0 !important", // Remove top outline
          //       borderBottomLeftRadius: "0 !important",
          //       borderBottomRightRadius: "0 !important",
          //   },
        }}
        slotProps={{
          input: { sx: { fontSize: 16 } },
          formHelperText: { sx: { fontSize: 13 } },
        }}
      />

      {/* <Box mt={1} sx={{ maxHeight: 100, overflowY: "auto" }}>
        {chips?.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            onDelete={() => handleDeleteChip(chip)}
            sx={{ mr: 1, mb: 1, fontSize: 14 }}
          />
        ))}
      </Box> */}
    </>
  );
};

export type SearchPartsHandlers = {
  handleInputChange: () => void;
};

type SearchPartsProps = {
  onSearchParts?: (handlers: SearchPartsHandlers) => void;
  formState: any;
};
