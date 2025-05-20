import {
  Box,
  Button,
  CircularProgress,
  Grid,
  InputLabel,
  Popover,
  useMediaQuery,
} from "@mui/material";
import { MouseEvent, useState } from "react";
// import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material/styles";
import {
  RangeKeyDict,
  DateRangePicker as ReactDateRange,
} from "react-date-range";

import { CalendarMonth, Cancel } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs"; //

const DateRange = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [filters, setFilters] = useState<IFilterAtom>({
    startDate: null,
    endDate: null,
  });

  const handleFilters = (key: keyof IFilterAtom, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleClose1 = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.stopPropagation();

    setStartDate(null);
    setEndDate(null);

    handleFilters("startDate", "");
    handleFilters("endDate", "");

    setAnchorEl(null);
  };

  const handleSelect = (ranges: RangeKeyDict) => {
    const selectedRange = ranges.selection;
    if (selectedRange.startDate && selectedRange.endDate) {
      const dayJsStart = dayjs(selectedRange.startDate);
      const dayJsEnd = dayjs(selectedRange.endDate);

      // 🛠 Only update if start is BEFORE or SAME AS end
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
          // className="!text-gray-600 border !border-gray-600 flex gap-1 !cursor-default"

          sx={{
            marginTop: 0.2,
            color: "gray",
            border: "1px solid gray",
            height: 50,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpen(e);
          }}
        >
          {!isMobile &&
            `${filters.startDate || "YYYY/MM/DD"} – ${filters.endDate || "YYYY/MM/DD"}`}
          <CalendarMonth />{" "}
          {filters.startDate && filters.endDate && (
            <Button
              className="cursor-pointer text-red-600"
              sx={{ marginLeft: "-10px" }}
              onClick={handleClose1}
            >
              <Cancel />
            </Button>
          )}
        </Button>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose1}
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
            className="flex justify-center gap-1  p-1"
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: 1,
              paddingBottom: "20px !important",
              // paddingY:4
            }}
          >
            <Button
              size="large"
              variant="outlined"
              color="secondary"
              // className="group h-5 !bg-[white] !border !border-black !text-black hover:!bg-white hover:!border-[#09C0F0] hover:!text-[#09C0F0] w-[48%]"
              sx={{ width: "48%" }}
              onClick={handleClose1}
            >
              Cancel
            </Button>

            <Button
              size="large"
              // type="submit"
              variant="contained"
              color="primary"
              // className="group h-5 !bg-[#09C0F0] !border !border-transparent hover:!bg-white hover:!border-[#09C0F0] hover:!text-[#09C0F0] w-[48%]"
              sx={{ width: "48%" }}
              onClick={() => {
                handleFilters("startDate", startDate?.format("YYYY-MM-DD")!);
                handleFilters("endDate", endDate?.format("YYYY-MM-DD")!);
                setAnchorEl(null);
              }}
            >
              {false ? (
                <CircularProgress
                  className="!text-white group-hover:!text-[#09C0F0]"
                  sx={{ scale: ".5" }}
                />
              ) : (
                "Search"
              )}
            </Button>
          </Box>
        </Popover>
      </Grid>
    </>
  );
};

export default DateRange;

interface IFilterAtom {
  // page: number;
  // pageSize: number;
  // status: 'completed' | 'notCompleted' | 'all';
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
}
