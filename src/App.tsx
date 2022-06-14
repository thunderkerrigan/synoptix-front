import React, { useState, useEffect, Fragment, KeyboardEvent } from "react";
import "./App.css";
import { ShadowWord, ShadowWordsCloud } from "./models/Word";
import axios from "axios";
import { Box, Stack, TextField, Typography } from "@mui/material";
// import parse from "html-react-parser";

const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || "";
const GET_SCORE_FOR_WORD_URL =
  process.env.REACT_APP_GET_SCORE_FOR_WORD_URL || "";

interface ShadowWordProps extends React.ComponentProps<"span"> {
  word: ShadowWord;
  lastWord: string;
}

const ShadowWordSpan = ({ word, lastWord }: ShadowWordProps) => {
  const html_tag_regexp = /<\/?.?>/g;
  const isAnHTMLTag = word.closestWord.match(html_tag_regexp);
  isAnHTMLTag && console.log("is an HTML tag", isAnHTMLTag);
  if (isAnHTMLTag && isAnHTMLTag[0] === word.closestWord) {
    return <span dangerouslySetInnerHTML={{ __html: word.closestWord }} />;
  }
  const isSimilar = word.similarity === 1;
  const isLastWord =
    word.closestWord.toLocaleLowerCase() === lastWord.toLocaleLowerCase();
  // const isSimilarAndLastWord = isSimilar && isLastWord;
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
  const text =
    word.closestWord.length > 0 ? word.closestWord.toString() : word.shadowWord;

  return <span style={style}>{text}</span>;
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
          overflow: "auto",
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
    let fullHintsRow = newMatchedHints + newNearHints;
    if (fullHintsRow.length === 0) {
      fullHintsRow = "🟥";
    }

    setSynopsis(modifiedSyno);
    setLastWord(requestedWord);
    setRequestedWord("");
    setHintsRow(<span>{`${requestedWord}: ${fullHintsRow}`}</span>);
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
          // backgroundColor: ,
          height: "100%",
        }}
        justifyContent="flex-start"
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="h1">! SYNOPTIX !</Typography>
        <Box>
          <TextField
            // inputProps={{ class backgroundColor: 'white' }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                boxShadow: "inset 0px 0px 4px black",
              },
            }}
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
