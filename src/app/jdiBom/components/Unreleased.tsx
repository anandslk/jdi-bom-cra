import { useState, useMemo } from "react";
import { useAppSelector } from "../store";
import { Alert, Box, Chip } from "@mui/material";
import { Dialog } from "src/app/jdiBom/components/Dialog";

export function Unreleased() {
  const { objectDetails } = useAppSelector((state) => state.jdiBom);

  const unreleasedItems = useMemo(
    () =>
      objectDetails.filter(
        (item) => item["Maturity State"]?.toLowerCase() !== "released",
      ),
    [objectDetails],
  );

  const unreleasedSignature = useMemo(
    () => JSON.stringify(unreleasedItems.map((item) => item.Title).sort()),
    [unreleasedItems],
  );

  const [dismissedSignature, setDismissedSignature] = useState<string | null>(
    null,
  );

  const showDialog =
    unreleasedItems.length > 0 && dismissedSignature !== unreleasedSignature;

  const onCancel = () => setDismissedSignature(unreleasedSignature);

  return (
    <UnreleasedItems
      onOpen={showDialog}
      onCancel={onCancel}
      unreleasedItems={unreleasedItems}
    />
  );
}

export const UnreleasedItems = ({
  onOpen,
  onCancel,
  unreleasedItems,
}: {
  onOpen: boolean;
  onCancel: () => void;
  unreleasedItems: IProductInfo[];
}) => {
  return (
    <Dialog
      isOpen={onOpen}
      title="Unreleased Parts"
      cancelText="Okay"
      onCancel={onCancel}
      disabled={false}
    >
      <Alert
        severity="error"
        sx={{
          width: "80%",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          marginX: "auto",
          marginY: 2,
          fontSize: 15,
          borderRadius: 2,
        }}
      >
        Some parts are not in Released state and cannot be selected for BOM
        commoning.
      </Alert>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1,
          marginY: 1,
        }}
      >
        {unreleasedItems?.map((item, i) => (
          <Chip
            key={i}
            label={item?.Title}
            color="error"
            sx={{ fontSize: 13 }}
          />
        ))}
      </Box>
    </Dialog>
  );
};
