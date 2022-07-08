import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  BoxProps,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { green, orange, red } from "@mui/material/colors";
import React, { KeyboardEvent, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface CountBoxProps extends BoxProps {
  firstColor: string;
  secondColor?: string;
}

const CountBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "firstColor" && prop !== "secondColor",
})<CountBoxProps>(({ firstColor, secondColor = firstColor, theme }) => ({
  background: `linear-gradient(to right, ${firstColor} 50%, ${secondColor} 50%)`,
  boxShadow: `inset 0px 0px 2px black`,
  fontWeight: "bold",
  fontSize: "0.8rem",
  textAlign: "center",
  color: "white",
  padding: "0 10px",
  borderRadius: "25px",
}));
const MatchBox = (props: { matchCount: number; nearCount: number }) => {
  const { matchCount, nearCount } = props;
  if (matchCount === 0 && nearCount === 0) {
    return (
      <CountBox width="90px" firstColor={red[500]}>
        0
      </CountBox>
    );
  }
  if (matchCount === 0 && nearCount > 0) {
    return (
      <CountBox width="90px" firstColor={orange[500]}>
        {nearCount}
      </CountBox>
    );
  }
  if (matchCount > 0 && nearCount === 0) {
    return (
      <CountBox width="90px" firstColor={green[500]}>
        {matchCount}
      </CountBox>
    );
  }
  return (
    <CountBox width="90px" firstColor={green[500]} secondColor={orange[500]}>
      <Stack direction="row" alignItems="center" justifyContent="space-around">
        <Box>{matchCount}</Box>
        <Box>{nearCount}</Box>
      </Stack>
    </CountBox>
  );
};

interface SearchInputProps {
  isLoading: boolean;
  submitWord: (requestedWord: string) => void;
}

const SearchInput = (props: SearchInputProps) => {
  const [requestedWord, setRequestedWord] = useState("");
  const { isLoading, submitWord } = props;
  const { lastWords } = useSelector((state: RootState) => state.game);
  const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
    if (e.key === "Enter") {
      sendScore();
    }
  };

  const sendScore = () => {
    if (!isLoading) {
      submitWord(requestedWord);
      setRequestedWord("");
    }
  };

  const handleScoreTextfieldChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setRequestedWord(value);
  };
  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        sx={{ width: "100%" }}
        freeSolo
        // getOptionLabel={(option) => option.word}
        options={Array.from(lastWords).sort((a, b) => b.index - a.index)}
        value={requestedWord}
        onInputChange={handleScoreTextfieldChange}
        onKeyUp={handleKeyboardEvent}
        renderOption={(props, option) => (
          <Box
            component="li"
            height="25px"
            borderBottom="1px solid #ccc"
            sx={{ backgroundColor: "rbga(255,255,255,0.4)" }}
            // sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            <Stack
              width="100%"
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="baseline" spacing={2}>
                <Typography variant="subtitle2">{option.index}.</Typography>
                <Typography variant="subtitle1">{option.label}</Typography>
              </Stack>
              <MatchBox
                matchCount={option.matchCount}
                nearCount={option.nearCount}
              />
            </Stack>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                boxShadow: "inset 0px 0px 4px black",
              },
            }}
            label="Saisir un mot/nombre/lettre"
            id="score-id"
          />
        )}
      />

      <LoadingButton
        loading={isLoading}
        variant="contained"
        onClick={sendScore}
      >
        Chercher
      </LoadingButton>
    </Stack>
  );
};

export default SearchInput;
