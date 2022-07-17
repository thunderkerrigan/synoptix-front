import {
  Help as HelpIcon,
  Leaderboard as LeaderboardIcon,
  MovieFilter as MovieFilterIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useAppDispatch } from "../hooks/useRedux";
import { showRules } from "../redux/rulesSlice";
import { showStats } from "../redux/statsSlice";

const SynoptixAppBar = () => {
  const dispatch = useAppDispatch();
  const openRules = () => dispatch(showRules());
  const openStats = () => dispatch(showStats());
  return (
    // <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Box sx={{ flex: 1 }} />
          <MovieFilterIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              mr: 2,
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            SYNOPTIX
          </Typography>
          <Stack direction="row" spacing={1}>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Stats">
                <IconButton sx={{ p: 0 }} onClick={openStats}>
                  <LeaderboardIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Règles">
                <IconButton sx={{ p: 0 }} onClick={openRules}>
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default SynoptixAppBar;
