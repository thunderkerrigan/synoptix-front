import React, {
  useState,
  useEffect,
  Fragment,
  KeyboardEvent,
  useMemo,
} from "react";
import "./App.css";
import { RedactedGame, ShadowWord, ShadowWordsCloud } from "./models/Word";
import axios from "axios";
import { Box, Collapse, Stack, TextField, Typography } from "@mui/material";
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
    padding: isSimilar ? "0" : "0 3px",
    // margin: isSimilar ? "inherit" : "0 1px",
    display: "inline-block",
    textAlign: "center",
    fontSize: "1.2em",
    lineHeight: "1.2",
    // height: "20px",
    transitionProperty: "background-color, color",
    transitionDuration: ".5s",
    transitionTimingFunction: "linear",
  };
  const text =
    word.closestWord.length > 0 ? word.closestWord.toString() : word.shadowWord;

  return <span style={style}>{text}</span>;
};

const loadCache = (
  key: string
): {
  currentShadowWords: ShadowWord[];
  allShadowWords: ShadowWord[];
} => {
  const cache = window.localStorage.getItem(key) || "[]";
  return { currentShadowWords: [], allShadowWords: JSON.parse(cache) };
};

const App = () => {
  const [title, setTitle] = useState<ShadowWordsCloud>([]);
  const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([]);
  const [matchedWords, setMatchedWords] = useState<{
    currentShadowWords: ShadowWord[];
    allShadowWords: ShadowWord[];
  }>(loadCache("matchedWords"));
  const [hintsRow, setHintsRow] = useState<React.ReactElement>(<Fragment />);
  const [lastWord, setLastWord] = useState<string>("");
  const [requestedWord, setRequestedWord] = useState<string>("");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<RedactedGame>(GET_CURRENT_GAME_URL);
      if (response.status === 200) {
        setTitle(response.data.redactedTitle);
        setSynopsis(response.data.redactedSynopsis);
      }
    };
    fetchData();
    return () => {
      console.log("cleanup");
    };
  }, []);

  useEffect(() => {
    console.log("save matchedWords");
    localStorage.setItem(
      "matchedWords",
      JSON.stringify(matchedWords.allShadowWords)
    );
  }, [matchedWords]);

  const content = useMemo(() => {
    const newTitleContent = title.map((line, row) => {
      return (
        <h1 key={`movie-title-${row}`}>
          <p>
            {line.map((word, index) => {
              return (
                <ShadowWordSpan
                  key={`child-movie-title-${row}-${index}`}
                  word={word}
                  lastWord={lastWord}
                />
              );
            })}
          </p>
        </h1>
      );
    });
    const newSynopsisContent = synopsis.map((line, row) => {
      return (
        <p key={`synopsis-${row}`}>
          {line.map((word, index) => {
            return (
              <ShadowWordSpan
                key={`child-synopsis-${row}-${index}`}
                word={word}
                lastWord={lastWord}
              />
            );
          })}
        </p>
      );
    });
    return (
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
        {newTitleContent}
        {newSynopsisContent}
      </Box>
    );
  }, [synopsis, lastWord, title]);

  const submitWord = async () => {
    console.log("start submitWord:");
    localStorage.setItem("TEST!!!!", "bonjour");
    const { data: scoredWords } = await axios.get<ShadowWord[]>(
      `${GET_SCORE_FOR_WORD_URL}${requestedWord}`
    );

    setLastWord(requestedWord);
    setRequestedWord("");
    setMatchedWords((prev) => {
      return {
        currentShadowWords: scoredWords,
        allShadowWords: [...prev.allShadowWords, ...scoredWords],
      };
    });
    console.log("end submitWord:");
  };
  useEffect(() => {
    const previousWordsIDs = matchedWords.allShadowWords.map((w) => w.id);
    // console.log("REDACTING! ==>", previousWordsIDs);
    const wordsIDs = matchedWords.currentShadowWords.map((w) => w.id);

    setTitle((previous) =>
      previous.map((row) =>
        row.map((s) => {
          const index = wordsIDs.indexOf(s.id);
          const isSimilar =
            index !== -1 &&
            matchedWords.currentShadowWords[index].similarity === 1;
          const isBetterFittedOrSimilar =
            isSimilar ||
            (index !== -1 &&
              matchedWords.currentShadowWords[index].similarity > s.similarity);
          if (index !== -1 && isBetterFittedOrSimilar) {
            return matchedWords.currentShadowWords[index];
          }
          const previousIndex = previousWordsIDs.indexOf(s.id);
          console.log("previousIndex: ", previousIndex);
          if (previousIndex !== -1) {
            // console.log("previousIndex: ", previousIndex);
            console.log(
              "found old: ",
              matchedWords.allShadowWords[previousIndex]
            );

            return matchedWords.allShadowWords[previousIndex];
          }
          return s;
        })
      )
    );
    setSynopsis((previous) =>
      previous.map((row) =>
        row.map((s) => {
          const index = wordsIDs.indexOf(s.id);
          const isSimilar =
            index !== -1 &&
            matchedWords.currentShadowWords[index].similarity === 1;
          const isBetterFittedOrSimilar =
            isSimilar ||
            (index !== -1 &&
              matchedWords.currentShadowWords[index].similarity > s.similarity);
          if (index !== -1 && isBetterFittedOrSimilar) {
            return matchedWords.currentShadowWords[index];
          }
          const previousIndex = previousWordsIDs.indexOf(s.id);
          console.log("previousIndex: ", previousIndex);
          if (previousIndex !== -1) {
            // console.log("previousIndex: ", previousIndex);
            console.log(
              "found old: ",
              matchedWords.allShadowWords[previousIndex]
            );

            return matchedWords.allShadowWords[previousIndex];
          }
          return s;
        })
      )
    );
  }, [matchedWords, lastWord]);

  useEffect(() => {
    setHintsRow(() => {
      const wordsIDs = matchedWords.currentShadowWords.map((w) => w.id);
      let newMatchedHints = "";
      let newNearHints = "";
      [...title, ...synopsis].forEach((row) => {
        row.forEach((s) => {
          const index = wordsIDs.indexOf(s.id);
          const isSimilar =
            index !== -1 &&
            matchedWords.currentShadowWords[index].similarity === 1;
          const isBetterFittedOrSimilar =
            isSimilar ||
            (index !== -1 &&
              matchedWords.currentShadowWords[index].similarity > s.similarity);
          if (index !== -1 && isBetterFittedOrSimilar) {
            if (isSimilar) {
              newMatchedHints += "🟩";
            } else {
              newNearHints += "🟧";
            }
          }
        });
      });

      let fullHintsRow = newMatchedHints + newNearHints;
      if (fullHintsRow.length === 0) {
        fullHintsRow = "🟥";
      }
      return <span>{`${lastWord}: ${fullHintsRow}`}</span>;
    });
  }, [matchedWords, lastWord, title, synopsis]);

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
    const foundTitle = title.every((row) => {
      return row.every((s) => s.similarity === 1);
    });
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
        <Collapse in={foundTitle}>
          <Box sx={{ backgroundColor: "lime", padding: 1, borderRadius:'5px' }}>
            <h1>BRAVO</h1>
          </Box>
        </Collapse>
        {hintsRow}
        {content}
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
