import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
} from "react";

import EditNoteIcon from "@mui/icons-material/EditNote";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { Box, InputLabel, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { route } from "../constants";

export const MultiSelectList = ({
  title,
  items,
  selected,
  onChange,
  multiSelect,
}: MultiSelectListProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();

        if (multiSelect) {
          (onChange as Dispatch<SetStateAction<string[]>>)([...items]);
        } else {
          // simulate an event
          const fakeEvent = new Event(
            "change",
          ) as unknown as ChangeEvent<HTMLSelectElement>;

          onChange(fakeEvent);
        }
      }
    };

    const selectEl = selectRef.current;
    if (selectEl) {
      selectEl.addEventListener("keydown", handleKeyDown);
      return () => selectEl.removeEventListener("keydown", handleKeyDown);
    }
  }, [items, onChange, multiSelect]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value,
    );

    if (multiSelect) onChange(selectedOptions);
    else onChange(e);
  };

  return (
    <Box>
      <InputLabel
        sx={{
          fontWeight: "bold",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          marginBottom: 1,
        }}
      >
        {title}

        {!multiSelect ? (
          <EditNoteIcon
            onClick={() => navigate(route.rdo)}
            sx={{ color: "#1976d2", fontSize: 22, cursor: "pointer" }}
          />
        ) : (
          <Tooltip
            title={
              <>
                <div>
                  <strong>Ctrl + A</strong>: Select all
                </div>
                <div>
                  <strong>Ctrl + Click</strong>: Toggle individual row selection
                </div>
                <div>
                  <strong>Shift + ↑ / ↓</strong>: Extend selection up/down
                </div>
                <div>
                  <strong>Shift + Click</strong>: Select range
                </div>
              </>
            }
            arrow
            slotProps={{ tooltip: { sx: { fontSize: "14px" } } }}
          >
            <InfoOutlineIcon
              sx={{
                color: "#1976d2",
                fontSize: 20,
                cursor: "pointer",
              }}
            />
          </Tooltip>
        )}
      </InputLabel>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: 1,
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.light}`,
          },
        }}
      >
        <select
          ref={selectRef}
          multiple={multiSelect}
          size={10}
          value={selected}
          onChange={handleChange}
          style={{
            width: "100%",
            height: "200px",
            border: "none",
            outline: "none",
            padding: "8px",
            fontFamily: "Roboto, sans-serif",
            fontSize: "1rem",
            backgroundColor: "#fafafa",
          }}
        >
          {!multiSelect && (
            <option value="" disabled>
              Please select
            </option>
          )}
          {items.map((item) => (
            <option
              key={item}
              value={item}
              style={{
                padding: "8px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {item}
            </option>
          ))}
        </select>
      </Box>
    </Box>
  );
};

type MultiSelectListProps =
  | {
      title: string;
      items: string[];
      selected: string[];
      onChange: Dispatch<SetStateAction<string[]>>;
      multiSelect: true;
    }
  | {
      title: string;
      items: string[];
      selected: string;
      onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
      multiSelect?: false | undefined;
    };
