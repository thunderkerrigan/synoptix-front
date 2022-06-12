import React, { useState, useEffect, Fragment, KeyboardEvent } from "react";
import "./App.css";
import { ShadowWord, ShadowWordsCloud } from "./models/Word";
import axios from "axios";
import { Box, Stack, TextField, Typography } from "@mui/material";
// import { TypographyProps } from "@mui/material/Typography";

const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || "";
const GET_SCORE_FOR_WORD_URL =
  process.env.REACT_APP_GET_SCORE_FOR_WORD_URL || "";

interface ShadowWordProps extends React.ComponentProps<"span"> {
  word: ShadowWord;
  lastWord: string;
}

const ShadowWordSpan = ({ word, lastWord }: ShadowWordProps) => {
  const isSimilar = word.similarity === 1;
  const isLastWord =
    word.closestWord.toLocaleLowerCase() === lastWord.toLocaleLowerCase();
  const isSimilarAndLastWord = isSimilar && isLastWord;
  const style: React.CSSProperties = {
    fontFamily: "monospace",
    borderRadius: "3px",
    backgroundColor: isSimilar ? "transparent" : "#333",
    color: isSimilar ? "black" : isLastWord ? "orange" : "grey",
    // width: `${word.shadowWord.length * 10}px`,
    whiteSpace: "pre",
    padding: isSimilar ? "0" : "0 5px",
    margin: isSimilar ? "inherit" : "0 1px",
    display: "inline-block",
    textAlign: "center",
    fontSize: "1.2em",
    lineHeight: "1.2",
    height: "20px",
    transitionProperty: "background-color, color",
    transitionDuration: ".5s",
    transitionTimingFunction: "linear",
  };

  return (
    <b>
      <span style={style}>
        {word.closestWord.length > 0 ? word.closestWord : word.shadowWord}
      </span>
    </b>
  );
};

const App = () => {
  const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([]);
  const [synopsisContent, setSynopsisContent] = useState<React.ReactElement>(
    <Fragment />
  );
  const [hintsRow, setHintsRow] = useState<React.ReactElement>(<Fragment />);
  const [lastWord, setLastWord] = useState<string>("");
  const [requestedWord, setRequestedWord] = useState<string>("");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<ShadowWordsCloud>(GET_CURRENT_GAME_URL);
      if (response.status === 200) {
        setSynopsis(response.data);
      }
    };
    fetchData();
    return () => {
      console.log("cleanup");
    };
  }, []);

  useEffect(() => {
    const newSynopsisContent = synopsis.map((line, row) => {
      return (
        <p>
          {line.map((word, index) => {
            return (
              <ShadowWordSpan
                key={`title-${row}-${index}`}
                word={word}
                lastWord={lastWord}
              />
            );
          })}
        </p>
      );
    });
    setSynopsisContent(
      <Box
        sx={{
          margin: "0 auto",
          width: "90%",
          alignContent: "center",
          display: "block",
          backgroundColor: "white",
          borderRadius: "5px",
          boxShadow: "inset 0px 0px 4px black",
          padding: "5px",
        }}
      >
        {newSynopsisContent}
      </Box>
    );
  }, [synopsis, lastWord]);

  const submitWord = async () => {
    console.log("start submitWord:");

    const { data: scoredWords } = await axios.get<ShadowWord[]>(
      `${GET_SCORE_FOR_WORD_URL}${requestedWord}`
    );
    const wordsIDs = scoredWords.map((w) => w.id);
    let newMatchedHints = "";
    let newNearHints = "";
    const modifiedSyno = synopsis.map((row) =>
      row.map((s) => {
        const index = wordsIDs.indexOf(s.id);
        const isSimilar = index !== -1 && scoredWords[index].similarity === 1;
        const isBetterFittedOrSimilar =
          isSimilar ||
          (index !== -1 && scoredWords[index].similarity > s.similarity);
        if (index !== -1 && isBetterFittedOrSimilar) {
          if (isSimilar) {
            newMatchedHints += "🟩";
          } else {
            newNearHints += "🟧";
          }
          return scoredWords[index];
        }
        return s;
      })
    );
    setSynopsis(modifiedSyno);
    setLastWord(requestedWord);
    setRequestedWord("");
    setHintsRow(<span>{newMatchedHints + newNearHints}</span>);
    console.log("end submitWord:");
  };

  const makeRedactedMessages = (synopsis: ShadowWordsCloud): JSX.Element => {
    if (synopsis.length === 0) {
      return <div>Loading...</div>;
    }
    const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
      // console.log("key:", e.key);
      e.key === "Enter" && submitWord();
    };

    const handleScoreTextfieldChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setRequestedWord(event.target.value);
    };

    return (
      <Stack
        sx={{
          backgroundColor: "#789bd3",
          height: "100vh",
        }}
        justifyContent="center"
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="h1">! SYNOPTIX !</Typography>
        <Box>
          <TextField
            label="Enter a word"
            id="score-id"
            value={requestedWord}
            onChange={handleScoreTextfieldChange}
            onKeyUp={handleKeyboardEvent}
          />
        </Box>
        {hintsRow}
        {synopsisContent}
      </Stack>
    );
  };
  return (
    <Box lineHeight="1.5" width="100%">
      {makeRedactedMessages(synopsis)}
    </Box>
  );
};

export default App;
