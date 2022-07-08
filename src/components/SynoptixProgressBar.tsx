import { LinearProgress, styled, Typography } from "@mui/material";
import { green, orange, red } from "@mui/material/colors";
import { Box } from "@mui/system";
import React from "react";
import { useAppSelector } from "../hooks/useRedux";

const SummaryProgress = styled(LinearProgress)(({ theme }) => ({
  //   height: "rem",
  "& .MuiLinearProgress-bar1Buffer": {
    backgroundColor: green[500],
  },
  "& .MuiLinearProgress-bar2Buffer": {
    backgroundColor: orange[500],
  },
  "& .MuiLinearProgress-dashedColorPrimary": {
    backgroundImage: `radial-gradient(${red[500]} 0%, ${red[500]} 16%, transparent 42%);`,
  },
}));

const SynoptixProgressBar = () => {
  const { summary } = useAppSelector((state) => state.game);
  const progress = (summary.found / summary.total) * 100;
  const buffer = ((summary.found + summary.near) / summary.total) * 100;
  return (
    <Box sx={{ width: "100%" }}>
      <SummaryProgress variant="buffer" value={progress} valueBuffer={buffer} />
      {summary.total > 0 && (
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          progress
        )}%`}</Typography>
      )}
    </Box>
  );
};

export default SynoptixProgressBar;
