import { Box, Button, Stack, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import { LoadingScreen } from "./LoadingScreen";
import { ReactNode, useEffect, useRef } from "react";

export function Dialog({
  children,
  isOpen,
  onSubmit,
  onCancel,
  disabled = false,
  title,
  cancelText,
  submitText,
  closeOnOutsideClick,
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

    if (isOpen && closeOnOutsideClick)
      window.addEventListener("mousedown", handleClickOutside, { signal });

    return () => controller.abort();
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Typography
          component={motion.div}
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 100,
            width: "100%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box
            component={motion.div}
            ref={dialogRef}
            sx={{
              background: "white",
              borderRadius: 4,
              padding: 2,
              minWidth: { sm: "70%", md: "40%" },
              maxWidth: { sm: "90%", md: "70%" },
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 22,
                marginBottom: 2,
              }}
            >
              {title}
            </Typography>

            {disabled && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  paddingY: 3,
                }}
              >
                <LoadingScreen message="Searching for parts..." />
              </Box>
            )}

            {children}

            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              className="pt-4"
            >
              {onSubmit && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSubmit}
                  disabled={disabled}
                  sx={{ fontSize: 14 }}
                >
                  {submitText || "Confirm"}
                </Button>
              )}

              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                disabled={disabled}
                sx={{ fontSize: 14 }}
              >
                {cancelText || "Cancel"}
              </Button>
            </Stack>
          </Box>
        </Typography>
      )}
    </AnimatePresence>
  );
}

interface IDialog {
  children: ReactNode;
  isOpen: boolean;
  disabled?: boolean;
  title: string;
  submitText?: string;
  cancelText?: string;

  onSubmit?: () => void;
  onCancel: () => void;

  closeOnOutsideClick?: boolean;
}
