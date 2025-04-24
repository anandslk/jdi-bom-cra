import { Button, Stack, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import { LoadingScreen } from "./LoadingScreen";
import { ReactNode, useEffect, useRef } from "react";

export function Dialog({
  children,
  isOpen,
  onSubmit,
  onCancel,
  disabled,
  title,
}: IDialog) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function handleClickOutside(event: MouseEvent) {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    }

    if (isOpen)
      window.addEventListener("mousedown", handleClickOutside, { signal });

    return () => controller.abort();
  }, [isOpen, onCancel]);

  return (
    <div className="flex justify-center items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-black/30 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={dialogRef}
              className="bg-white rounded-2xl !p-6 shadow-xl min-w-[70%] md:min-w-[40%] max-w-[60%]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {title}
              </Typography>

              {disabled && (
                <div className="w-full flex justify-center py-4">
                  <LoadingScreen message="Searching for parts..." />
                </div>
              )}

              {children}

              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                className="pt-4"
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSubmit}
                  disabled={disabled}
                >
                  Confirm
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancel}
                  disabled={disabled}
                >
                  Cancel
                </Button>
              </Stack>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface IDialog {
  children: ReactNode;
  isOpen: boolean;
  disabled: boolean;
  title: string;

  onSubmit: () => void;
  onCancel: () => void;
}
