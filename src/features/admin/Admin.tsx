import {
  AddBox as AddBoxIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Button, Paper, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetRequest } from "../../hooks/useGetRequest";
import { usePostRequest } from "../../hooks/usePostRequest";
import { WikipediaMovie } from "../../models/Movie";
import { MovieRequest } from "../../models/Request";
import ResetDialog from "./ResetDialog";

const ADMIN_GET_MOVIE_URL = process.env.REACT_APP_ADMIN_GET_MOVIE_URL || "";
const ADMIN_POST_MOVIE_URL = process.env.REACT_APP_ADMIN_POST_MOVIE_URL || "";

const Admin = () => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [token, setToken] = useState(
    localStorage.getItem("synoptix-admin-token")
  );
  const location = useLocation();
  const [searchField, setSearchField] = useState("");

  const [movie, fetchMovie, isLoading, error] =
    useGetRequest<WikipediaMovie>(ADMIN_GET_MOVIE_URL);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addedMovie, addMovie, isUploading] = usePostRequest<
    MovieRequest,
    boolean
  >(ADMIN_POST_MOVIE_URL);

  useEffect(() => {
    console.log("error:", error);
    if (error && error === "401") {
      localStorage.removeItem("synoptix-admin-token");
      setToken(null);
    }
  }, [error]);

  const handleSearch = useCallback(() => {
    if (token) {
      fetchMovie(searchField, token);
    }
  }, [fetchMovie, searchField, token]);

  const handleAddMovie = useCallback(() => {
    if (token && movie) {
      addMovie(
        { id: movie.id, title: movie.title, synopsis: movie.synopsis },
        token
      );
    }
  }, [addMovie, movie, token]);

  const handleOpenDialog = () => setOpenConfirmDialog(true);
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box width="75%" m="auto" p={2}>
      <ResetDialog
        isOpen={openConfirmDialog}
        handleClose={() => setOpenConfirmDialog(false)}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          id="movie"
          label="Movie"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        />
        <LoadingButton
          startIcon={<SearchIcon />}
          color="secondary"
          loading={isLoading}
          variant="contained"
          onClick={handleSearch}
        >
          Chercher
        </LoadingButton>
        {movie && !isLoading && (
          <LoadingButton
            startIcon={<AddBoxIcon />}
            loading={isUploading}
            variant="contained"
            onClick={handleAddMovie}
          >
            Ajouter
          </LoadingButton>
        )}
        <Box flexGrow={1} />
        <Button
          startIcon={<WarningIcon />}
          variant="contained"
          color="warning"
          onClick={handleOpenDialog}
        >
          Reset Game Date
        </Button>
      </Stack>
      <Paper>
        {movie && (
          <Box p={1} m={1}>
            <div dangerouslySetInnerHTML={{ __html: movie.title }} />
          </Box>
        )}
      </Paper>
      <Paper>
        {movie && (
          <Box p={1} m={1}>
            <div dangerouslySetInnerHTML={{ __html: movie.synopsis }} />
          </Box>
        )}
      </Paper>
      <Paper>
        {movie && (
          <Box p={1} m={1}>
            <div
              dangerouslySetInnerHTML={{ __html: movie.untreatedSynopsis }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Admin;
