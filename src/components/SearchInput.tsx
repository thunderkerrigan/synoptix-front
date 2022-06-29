import { LoadingButton } from "@mui/lab";
import { Autocomplete, Box, Stack, TextField, Typography } from "@mui/material";
import React, { KeyboardEvent } from "react";
import { LastWord } from "../models/Word";

interface SearchInputProps {
  requestedWord: string;
  isLoading: boolean;
  submitWord: () => void;
  onTextChange: (word: string) => void;
  lastScoredWords: LastWord[];
}

const SearchInput = (props: SearchInputProps) => {
  const {
    requestedWord,
    isLoading,
    submitWord,
    onTextChange,
    lastScoredWords,
  } = props;

  const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
    // console.log("key:", e.key);
    !isLoading && e.key === "Enter" && submitWord();
  };

  const handleScoreTextfieldChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    onTextChange(value);
  };
  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        sx={{ width: "100%" }}
        freeSolo
        // getOptionLabel={(option) => option.word}
        options={lastScoredWords.sort((a, b) => b.index - a.index)}
        value={requestedWord}
        onInputChange={handleScoreTextfieldChange}
        onKeyUp={handleKeyboardEvent}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{ backgroundColor: "rbga(255,255,255,0.4)" }}
            // sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            <Stack
              width="100%"
              direction="row"
              spacing={2}
              alignItems="center"
              // justifyContent="space-between"
              justifyContent="flex-start"
            >
              <Typography variant="h5">{option.index}.</Typography>
              <Typography variant="h6">{option.label}</Typography>
              {/* <Avatar>{option.count}</Avatar> */}
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
        onClick={submitWord}
      >
        Chercher
      </LoadingButton>
    </Stack>
  );
};

export default SearchInput;
