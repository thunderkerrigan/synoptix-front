import React, { Fragment, useEffect, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { hideStats } from "../redux/statsSlice";
import { Leaderboard as LeaderboardIcon } from "@mui/icons-material";
import { useGetRequest } from "../hooks/useGetRequest";

interface MovieResume {
  title: string;
  date: string;
}

const GET_UPDATE_STATISTICS_URL =
  process.env.REACT_APP_GET_UPDATE_STATISTICS_URL || "";

const Stats = () => {
  const showStats = useAppSelector((state) => state.showStats);
  const dispatch = useAppDispatch();
  const [movieList, fetch, isLoading] = useGetRequest<MovieResume[]>(
    GET_UPDATE_STATISTICS_URL
  );
  const closeStats = () => dispatch(hideStats());
  useEffect(() => {
    if (showStats) {
      fetch();
    }
  }, [showStats, fetch]);

  const list = useMemo(() => {
    if (isLoading) {
      return (
        <List>
          <ListItem>Loading...</ListItem>
        </List>
      );
    }
    if (movieList) {
      return (
        <List>
          {movieList.map((movie) => (
            <ListItem key={movie.title}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">{movie.date}:</Typography>
                <div dangerouslySetInnerHTML={{ __html: movie.title }} />
              </Stack>
            </ListItem>
          ))}
        </List>
      );
    }
    return <Fragment />;
  }, [isLoading, movieList]);

  return (
    <Dialog open={showStats}>
      <DialogTitle>
        <Stack direction="row" display="flex" alignItems="center" spacing={1}>
          <LeaderboardIcon />
          <Typography variant="h6">Films précédents</Typography>
        </Stack>
      </DialogTitle>
      {list}

      <Button
        sx={{
          width: "200px",
          margin: "auto",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
        variant="contained"
        onClick={closeStats}
      >
        OK
      </Button>
    </Dialog>
  );
};

export default Stats;
