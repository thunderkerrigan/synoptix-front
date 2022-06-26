import { LoadingButton } from "@mui/lab";
import { Stack, TextField } from "@mui/material";
import React, { KeyboardEvent } from "react";

interface SearchInputProps {
  requestedWord: string;
  isLoading: boolean;
  submitWord: () => void;
  onTextChange: (word: string) => void;
}

const SearchInput = (props: SearchInputProps) => {
  const { requestedWord, isLoading, submitWord, onTextChange } = props;

  const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
    // console.log("key:", e.key);
    !isLoading && e.key === "Enter" && submitWord();
  };

  const handleScoreTextfieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onTextChange(event.target.value);
  };
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            boxShadow: "inset 0px 0px 4px black",
          },
        }}
        label="Saisir un mot/nombre/lettre"
        id="score-id"
        value={requestedWord}
        onChange={handleScoreTextfieldChange}
        onKeyUp={handleKeyboardEvent}
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
