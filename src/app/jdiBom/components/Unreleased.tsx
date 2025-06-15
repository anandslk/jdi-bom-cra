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
    <ItemsDialog
      title="Unreleased Parts"
      description="Some parts are not in Released state and cannot be selected for BOM
        commoning."
      onOpen={showDialog}
      onCancel={onCancel}
      items={unreleasedItems?.map((item) => item?.Title)}
    />
  );
}

export const ItemsDialog = ({
  title,
  description,
  onOpen,
  onCancel,
  items,
}: {
  title: string;
  description: string;
  onOpen: boolean;
  onCancel: () => void;
  items: string[];
}) => {
  return (
    <Dialog
      isOpen={onOpen}
      title={title}
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
        {description}
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
        {items?.map((item, i) => (
          <Chip key={i} label={item} color="error" sx={{ fontSize: 13 }} />
        ))}
      </Box>
    </Dialog>
  );
};
