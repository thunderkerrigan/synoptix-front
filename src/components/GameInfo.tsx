import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { green, yellow } from "@mui/material/colors";
import { useAppSelector } from "../hooks/useRedux";
import SynoptixProgressBar from "./SynoptixProgressBar";

const boxStyle = {
  margin: "0 auto",
  width: "100%",
  alignContent: "center",
  display: "block",
  backgroundColor: yellow[400],
  borderRadius: "5px",
  boxShadow: "inset 0px 0px 4px black",
  padding: "5px",
  overflow: "auto",
};

const GameInfo = () => {
  const { gameID, lastMovie, foundBy } = useAppSelector((state) => state.game);
  const foundByText = `trouvé par ${foundBy} personne${foundBy > 1 ? "s" : ""}`;
  return (
    <Box sx={boxStyle}>
      <Stack spacing={1} margin={1}>
        <Typography
          sx={{ textAlign: "center" }}
          variant="h4"
        >{`jour ${gameID}`}</Typography>
        <Typography variant="subtitle2">{foundByText}</Typography>
        <SynoptixProgressBar />
        <Box>
          <Typography variant="subtitle1">{`le film d'hier était:`}</Typography>
          <Typography
            sx={{
              color: green[900],
              fontWeight: "bold",
              textDecorationLine: "underline",
            }}
            variant="subtitle2"
          >{`${lastMovie}.`}</Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default GameInfo;
