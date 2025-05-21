import {
  Box,
  Button,
  Grid,
  IconButton,
  InputLabel,
  Popover,
  useMediaQuery,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  RangeKeyDict,
  DateRangePicker as ReactDateRange,
} from "react-date-range";

import { CalendarMonth, Cancel } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

const DateRange = ({ filters, handleFilters }: IDateRange) => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClearAndClose = (
    e: MouseEvent<HTMLButtonElement | HTMLElement>,
  ) => {
    e.stopPropagation();

    handleFilters("startDate", "");
    handleFilters("endDate", "");

    setStartDate(null);
    setEndDate(null);

    setAnchorEl(null);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleSelect = (ranges: RangeKeyDict) => {
    const selectedRange = ranges.selection;
    if (selectedRange.startDate && selectedRange.endDate) {
      const dayJsStart = dayjs(selectedRange.startDate);
      const dayJsEnd = dayjs(selectedRange.endDate);

      if (dayJsStart.isBefore(dayJsEnd) || dayJsStart.isSame(dayJsEnd, "day")) {
        setStartDate(dayJsStart);
        setEndDate(dayJsEnd);
      }
    }
  };

  return (
    <>
      <Grid>
        <InputLabel sx={{ fontSize: 16 }}>Select Date Range</InputLabel>
        <Button
          component="div"
          variant="outlined"
          sx={{
            marginTop: 0.2,
            color: "gray",
            border: "1px solid gray",
            height: 50,
            fontSize: 15,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
          onClick={handleOpen}
        >
          {!isMobile &&
            `${startDate?.format("YYYY/MM/DD") || "YYYY/MM/DD"} – ${endDate?.format("YYYY/MM/DD") || "YYYY/MM/DD"}`}
          <CalendarMonth sx={{ fontSize: 23 }} />
          {filters.startDate && filters.endDate && (
            <IconButton onClick={handleClearAndClose} size="small">
              <Cancel sx={{ fontSize: 23 }} />
            </IconButton>
          )}
        </Button>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <ReactDateRange
            months={2}
            direction={isMobile ? "vertical" : "horizontal"}
            staticRanges={[]}
            inputRanges={[]}
            ranges={[
              {
                startDate: startDate ? startDate.toDate() : new Date(),
                endDate: endDate ? endDate.toDate() : new Date(),
                key: "selection",
              },
            ]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            editableDateInputs={true}
            retainEndDateOnFirstSelection={true}
          />

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: 1,
              paddingBottom: "20px !important",
            }}
          >
            <Button
              size="large"
              variant="outlined"
              color="secondary"
              sx={{ width: "48%", fontSize: 15 }}
              onClick={handleClearAndClose}
            >
              Cancel
            </Button>

            <Button
              size="large"
              variant="contained"
              color="primary"
              sx={{ width: "48%", fontSize: 15 }}
              onClick={() => {
                handleFilters("startDate", startDate?.toISOString()!);
                handleFilters("endDate", endDate?.toISOString()!);
                handleFilters("page", 0);

                setAnchorEl(null);
              }}
            >
              Search
            </Button>
          </Box>
        </Popover>
      </Grid>
    </>
  );
};

export default DateRange;

export interface IFilterAtom {
  search: string;
  page: number;
  rowsPerPage: number;
  status: "All" | "In Process" | "Completed" | "Failed";
  sortOrder: "ASC" | "DESC";
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
}

export interface IDateRange {
  filters: IFilterAtom;
  handleFilters: (key: keyof IFilterAtom, value: string | number) => void;
}
