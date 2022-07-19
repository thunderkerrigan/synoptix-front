import { Warning as WarningIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useGetRequest } from "../../hooks/useGetRequest";

const ADMIN_GET_RESET_DATE_URL =
  process.env.REACT_APP_ADMIN_GET_RESET_DATE_URL || "";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const ResetDialog = (props: Props) => {
  const [token, setToken] = useState(
    localStorage.getItem("synoptix-admin-token")
  );
  const [text, setText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, fetchReset, isLoading, error] = useGetRequest<void>(
    ADMIN_GET_RESET_DATE_URL
  );
  const { isOpen, handleClose } = props;
  const enableButton = text === "Effacer";

  useEffect(() => {
    console.log("error:", error);
    if (error && error === "401") {
      localStorage.removeItem("synoptix-admin-token");
      setToken(null);
    }
  }, [error]);

  const handleResetGames = useCallback(() => {
    if (token) {
      fetchReset(undefined, token);
    }
  }, [fetchReset, token]);
  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        <WarningIcon />
        Attention !
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          Souhaitez vous vraiment reset les jeux? Si oui, veuillez taper
          "Effacer" et valider.
          <TextField
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Box flexGrow={1} />
            <LoadingButton
              startIcon={<WarningIcon />}
              variant="contained"
              color="error"
              loading={isLoading}
              disabled={!enableButton}
              onClick={handleResetGames}
            >
              Valider
            </LoadingButton>
            <Button variant="contained" onClick={handleClose}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ResetDialog;
