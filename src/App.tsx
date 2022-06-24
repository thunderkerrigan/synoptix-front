import React, {
  useState,
  useEffect,
  Fragment,
  KeyboardEvent,
  useMemo,
} from "react";
import "./App.css";
import {
  RedactedGame,
  replaceWords,
  ShadowWord,
  ShadowWordsCloud,
  WordsDictionary,
} from "./models/Word";
import { Box, Collapse, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { countHints, makeHintsCountText } from "./utils/text";
import { ShadowWordSpan } from "./components/ShadowWordSpan";
import { useGetRequest } from "./hooks/useGetRequest";
import { usePostRequest } from "./hooks/usePostRequest";
import { ScoreRequest, ScoreResponse } from "./models/Request";
import Footer from "./components/Footer";
import { v4 as uuid } from "uuid";
import { log } from "console";
// import parse from "html-react-parser";

const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || "";
const POST_SCORE_FOR_WORD_URL =
  process.env.REACT_APP_POST_SCORE_FOR_WORD_URL || "";

const loadCache = (): WordsDictionary => {
  const cacheMatchedWords = window.localStorage.getItem("matchedWords") || "{}";
  const cacheGameID = window.localStorage.getItem("gameID") || "-1";
  const cacheFoundBy = window.localStorage.getItem("foundBy") || "0";
  const cacheScoreCount = window.localStorage.getItem("scoreCount") || "0";
  const cacheFoundScore = window.localStorage.getItem("foundScore") || "-1";
  const userID = window.localStorage.getItem("userID") || uuid();
  const foundBy = parseInt(cacheFoundBy);
  const foundScore = parseInt(cacheFoundScore);
  const gameID = parseInt(cacheGameID);
  const scoreCount = parseInt(cacheScoreCount);
  const allShadowWordsRaw = JSON.parse(cacheMatchedWords);
  const allShadowWords = Object.entries<ShadowWord>(allShadowWordsRaw).reduce<
    Record<string, ShadowWord>
  >((acc, [key, value]) => {
    acc[key] = new ShadowWord(value);
    return acc;
  }, {});

  return {
    userID,
    gameID,
    scoreCount,
    foundScore,
    currentShadowWords: {},
    allShadowWords,
    foundBy,
  };
};

const App = () => {
  const [title, setTitle] = useState<ShadowWordsCloud>([]);
  const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([]);
  const [matchedWords, setMatchedWords] = useState<WordsDictionary>(
    loadCache()
  );
  const [hintsRow, setHintsRow] = useState<React.ReactElement>(<Fragment />);
  const [lastWord, setLastWord] = useState<string>("");
  const [requestedWord, setRequestedWord] = useState<string>("");
  const [game, gameRequest] = useGetRequest<RedactedGame>(GET_CURRENT_GAME_URL);
  const [score, scoreRequest, isScoreLoading] = usePostRequest<
    ScoreRequest,
    ScoreResponse
  >(POST_SCORE_FOR_WORD_URL);

  useEffect(() => {
    gameRequest();
  }, [gameRequest]);

  useEffect(() => {
    if (game) {
      setTitle(
        game.redactedTitle.map((c) =>
          c.map((w) => new ShadowWord(w)).map(replaceWords(matchedWords))
        )
      );
      setSynopsis(
        game.redactedSynopsis.map((c) =>
          c.map((w) => new ShadowWord(w)).map(replaceWords(matchedWords))
        )
      );
      if (game.gameID !== matchedWords.gameID) {
        setMatchedWords({
          userID: matchedWords.userID,
          scoreCount: 0,
          foundScore: -1,
          gameID: game.gameID,
          currentShadowWords: {},
          allShadowWords: {},
          foundBy: game.foundBy,
        });
      }
    }
  }, [game, matchedWords]);

  useEffect(() => {
    localStorage.setItem(
      "matchedWords",
      JSON.stringify(matchedWords.allShadowWords)
    );
    localStorage.setItem("gameID", JSON.stringify(matchedWords.gameID));
    localStorage.setItem("foundBy", JSON.stringify(matchedWords.foundBy));
    localStorage.setItem("userID", JSON.stringify(matchedWords.userID));
    localStorage.setItem("scoreCount", JSON.stringify(matchedWords.scoreCount));
    localStorage.setItem("foundScore", JSON.stringify(matchedWords.foundScore));
  }, [matchedWords]);

  const content = useMemo(() => {
    const latestWordIDs = Object.keys(matchedWords.currentShadowWords);

    const newTitleContent = title.map((line, row) => {
      return (
        <h1 key={`movie-title-${row}`}>
          <p>
            {line.map((word, index) => {
              return (
                <ShadowWordSpan
                  key={`child-movie-title-${row}-${index}`}
                  word={word}
                  isLastWord={latestWordIDs.some(
                    (id) => id === word.id.toString()
                  )}
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
                isLastWord={latestWordIDs.some(
                  (id) => id === word.id.toString()
                )}
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
  }, [matchedWords.currentShadowWords, synopsis, title]);
  useEffect(() => {}, []);
  const submitWord = async () => {
    // console.log('start submitWord:')
    const trimmedWord = requestedWord.replace(" ", "");
    if (trimmedWord.length > 0) {
      const wordIDs = title
        .reduce((acc, curr) => [...acc, ...curr], [])
        .map((w) => w.id);
      scoreRequest({ word: trimmedWord, wordIDs, userID: matchedWords.userID });

      setLastWord(trimmedWord);
      setRequestedWord("");
    }
  };
  useEffect(() => {
    if (
      matchedWords.foundScore === -1 &&
      title.every((row) => {
        return row.every((s) => s.similarity === 1);
      })
    ) {
      setMatchedWords((prev) => ({ ...prev, foundScore: prev.foundBy }));
    }
  }, [matchedWords.foundScore, title]);

  useEffect(() => {
    if (score) {
      const { score: newScore, foundBy } = score;
      console.log("foundBy:", foundBy);

      setMatchedWords((prev) => {
        const newAllShadowWords = {
          ...prev.allShadowWords,
          ...newScore
            .filter((w) => {
              const foundPrevious = prev.allShadowWords[w.id];
              return !foundPrevious || foundPrevious.similarity < w.similarity;
            })
            .reduce<Record<number, ShadowWord>>((acc, w) => {
              acc[w.id] = new ShadowWord(w);
              return acc;
            }, {}),
        };

        return {
          ...prev,
          scoreCount:
            prev.foundScore !== -1 ? prev.scoreCount : prev.scoreCount + 1,
          foundBy,
          currentShadowWords: newScore.reduce<Record<number, ShadowWord>>(
            (acc, w) => {
              const existingShadowWord = prev.allShadowWords[w.id];
              if (
                w.similarity === 1 ||
                !existingShadowWord ||
                existingShadowWord.similarity < w.similarity
              ) {
                acc[w.id] = new ShadowWord(w);
              }
              return acc;
            },
            {}
          ),
          allShadowWords: newAllShadowWords,
        };
      });
    }
  }, [score]);

  useEffect(() => {
    setTitle((previous) =>
      previous.map((row) => row.map(replaceWords(matchedWords)))
    );

    setSynopsis((previous) =>
      previous.map((row) => row.map(replaceWords(matchedWords)))
    );
  }, [matchedWords]);

  useEffect(() => {
    if (!lastWord || isScoreLoading) {
      return setHintsRow(<Fragment />);
    }
    const { newMatchedHints, newNearHints } = countHints(
      [...title, ...synopsis],
      matchedWords.currentShadowWords
    );
    let fullHintsRow = makeHintsCountText(newMatchedHints, newNearHints);

    setHintsRow(
      <p>
        <b>{`${lastWord}: ${fullHintsRow}`}</b>
      </p>
    );
  }, [matchedWords, lastWord, isScoreLoading, title, synopsis]);

  const makeRedactedMessages = (synopsis: ShadowWordsCloud): JSX.Element => {
    if (synopsis.length === 0) {
      return <div>Loading...</div>;
    }
    const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
      // console.log("key:", e.key);
      !isScoreLoading && e.key === "Enter" && submitWord();
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

        <Stack direction="row" spacing={2}>
          <TextField
            // inputProps={{ class backgroundColor: 'white' }}
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
            loading={isScoreLoading}
            variant="contained"
            onClick={submitWord}
          >
            Chercher
          </LoadingButton>
        </Stack>
        <Collapse in={foundTitle} timeout={800} unmountOnExit={true}>
          <Box
            sx={{
              backgroundColor: "lime",
              padding: 1,
              borderRadius: "5px",
            }}
          >
            <h1>BRAVO</h1>
            <p>
              <span>vous êtes </span>
              <b>
                {matchedWords.foundScore}
                <sup>e</sup>
              </b>
              <span> à avoir trouvé le film, en </span>
              <b>{`${matchedWords.scoreCount} coup${
                matchedWords.scoreCount > 1 ? "s" : ""
              }`}</b>
            </p>
          </Box>
        </Collapse>
        {hintsRow}
        {content}
        {/* <Stack direction="row" spacing="auto"> */}
        <Footer />
      </Stack>
      // </Stack>
    );
  };
  return (
    <Box lineHeight="1.5" width="100%">
      {makeRedactedMessages(synopsis)}
    </Box>
  );
};

export default App;
