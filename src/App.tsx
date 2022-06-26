import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import {
  RedactedGame,
  replaceWords,
  ShadowWord,
  ShadowWordsCloud,
  WordsDictionary,
} from "./models/Word";
import {
  Box,
  LinearProgress,
  Stack,
  StackProps,
  styled,
  Typography,
} from "@mui/material";
import { useGetRequest } from "./hooks/useGetRequest";
import { usePostRequest } from "./hooks/usePostRequest";
import { ScoreRequest, ScoreResponse } from "./models/Request";
import Footer from "./components/Footer";
import { v4 as uuid } from "uuid";
import Hints from "./components/Hints";
import ObfuscatedText from "./components/ObfuscatedText";
import WinPanel from "./components/WinPanel";
import { summarizedGame } from "./utils/text";
import SearchInput from "./components/SearchInput";

const GET_UPDATE_STATUS_URL = process.env.REACT_APP_GET_UPDATE_STATUS_URL || "";
const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || "";
const POST_SCORE_FOR_WORD_URL =
  process.env.REACT_APP_POST_SCORE_FOR_WORD_URL || "";

const loadCache = (): WordsDictionary => {
  try {
    const cacheMatchedWords =
      window.localStorage.getItem("matchedWords") || "{}";
    const cacheResponse = window.localStorage.getItem("response") || "[]";
    const cacheGameID = window.localStorage.getItem("gameID") || "-1";
    const cacheFoundBy = window.localStorage.getItem("foundBy") || "0";
    const cacheScoreCount = window.localStorage.getItem("scoreCount") || "0";
    const cacheFoundScore = window.localStorage.getItem("foundScore") || "-1";
    const userID = window.localStorage.getItem("userID") || uuid();
    const summarizedGame = window.localStorage.getItem("summarizedGame") || "";
    const foundBy = parseInt(cacheFoundBy);
    const foundScore = parseInt(cacheFoundScore);
    const gameID = parseInt(cacheGameID);
    const scoreCount = parseInt(cacheScoreCount);
    const allShadowWordsRaw = JSON.parse(cacheMatchedWords);
    const response = JSON.parse(cacheResponse);
    const allShadowWords = Object.entries<ShadowWord>(allShadowWordsRaw).reduce<
      Record<string, ShadowWord>
    >((acc, [key, value]) => {
      acc[key] = new ShadowWord(value);
      return acc;
    }, {});

    return {
      userID,
      gameID,
      summarizedGame,
      response,
      scoreCount,
      foundScore,
      currentShadowWords: {},
      allShadowWords,
      foundBy,
    };
  } catch (error) {
    return {
      userID: uuid(),
      gameID: -1,
      summarizedGame: "",
      response: [],
      scoreCount: 0,
      foundScore: -1,
      currentShadowWords: {},
      allShadowWords: {},
      foundBy: 0,
    };
  }
};

const StickyStack = styled(Stack)<StackProps>(({ theme }) => ({
  [theme.breakpoints.down("lg")]: {
    minHeight: "100px",
    backgroundColor: "#789bd3",
    position: "sticky",

    top: 0,

    width: "100%",
    zIndex: 1,
    padding: "10px",
    boxShadow: "inset 0px 0px 4px black",
  },
}));

const App = () => {
  const [title, setTitle] = useState<ShadowWordsCloud>([]);
  const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([]);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [matchedWords, setMatchedWords] = useState<WordsDictionary>(
    loadCache()
  );
  const [lastWord, setLastWord] = useState<string>("");
  const [requestedWord, setRequestedWord] = useState<string>("");
  const [game, gameRequest, isGameLoading] =
    useGetRequest<RedactedGame>(GET_CURRENT_GAME_URL);
  const [update, updateRequest] = useGetRequest<RedactedGame>(
    GET_UPDATE_STATUS_URL
  );
  const [score, scoreRequest, isScoreLoading] = usePostRequest<
    ScoreRequest,
    ScoreResponse
  >(POST_SCORE_FOR_WORD_URL);

  useEffect(() => {
    gameRequest();
  }, [gameRequest]);

  useEffect(() => {
    const timeout = setInterval(() => {
      updateRequest();
    }, 30 * 1000);
    return () => clearInterval(timeout);
  }, [updateRequest]);

  useEffect(() => {
    if (
      update &&
      update.gameID &&
      update.gameID.toLocaleString() !== matchedWords.gameID.toLocaleString()
    ) {
      gameRequest();
    }
  }, [gameRequest, matchedWords.gameID, update]);
  useEffect(() => {
    if (game) {
      setTitle(
        game.redactedTitle.map((c) =>
          c
            .map((w) => new ShadowWord(w))
            .map(replaceWords(matchedWords.allShadowWords))
        )
      );
      setSynopsis(
        game.redactedSynopsis.map((c) =>
          c
            .map((w) => new ShadowWord(w))
            .map(replaceWords(matchedWords.allShadowWords))
        )
      );
      if (game.gameID !== matchedWords.gameID) {
        setMatchedWords((prev) => ({
          userID: prev.userID,
          scoreCount: 0,
          foundScore: -1,
          summarizedGame: "",
          response: [],
          gameID: game.gameID,
          currentShadowWords: {},
          allShadowWords: {},
          foundBy: game.foundBy,
        }));
      }
    }
  }, [game, matchedWords.allShadowWords, matchedWords.gameID]);

  useEffect(() => {
    localStorage.setItem(
      "matchedWords",
      JSON.stringify(matchedWords.allShadowWords)
    );
    localStorage.setItem("response", JSON.stringify(matchedWords.response));
    localStorage.setItem("gameID", matchedWords.gameID.toString());
    localStorage.setItem("foundBy", matchedWords.foundBy.toString());
    localStorage.setItem("userID", matchedWords.userID);
    localStorage.setItem("summarizedGame", matchedWords.summarizedGame);
    localStorage.setItem("scoreCount", matchedWords.scoreCount.toString());
    localStorage.setItem("foundScore", matchedWords.foundScore.toString());
  }, [matchedWords]);

  const content = useMemo(() => {
    if (isGameLoading) {
      return (
        <Stack spacing={1}>
          <Typography>Loading...</Typography>
          <LinearProgress />
        </Stack>
      );
    }
    if (showResponse) {
      return ObfuscatedText({
        title,
        synopsis: matchedWords.response,
        currentShadowWords: matchedWords.currentShadowWords,
      });
    }

    return ObfuscatedText({
      title,
      synopsis,
      currentShadowWords: matchedWords.currentShadowWords,
    });
  }, [
    isGameLoading,
    matchedWords.currentShadowWords,
    matchedWords.response,
    showResponse,
    synopsis,
    title,
  ]);

  const submitWord = async () => {
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
      const { score: newScore, foundBy, response = [] } = score;
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
          response,
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
      previous.map((row) => row.map(replaceWords(matchedWords.allShadowWords)))
    );

    setSynopsis((previous) =>
      previous.map((row) => row.map(replaceWords(matchedWords.allShadowWords)))
    );
  }, [matchedWords.allShadowWords]);

  useEffect(() => {
    setMatchedWords((prev) => ({
      ...prev,
      summarizedGame:
        prev.foundScore !== -1
          ? prev.summarizedGame
          : summarizedGame([...title, ...synopsis]),
    }));
  }, [synopsis, title]);

  const hintsRow = useMemo(() => {
    return Hints({
      text: [...title, ...synopsis],
      currentShadowWords: matchedWords.currentShadowWords,
      lastWord,
      isScoreLoading,
    });
  }, [matchedWords, lastWord, isScoreLoading, title, synopsis]);

  const foundTitle =
    !isGameLoading &&
    title.every((row) => {
      return row.every((s) => s.similarity === 1);
    });
  const winPanel = WinPanel({
    foundTitle,
    foundScore: matchedWords.foundScore,
    scoreCount: matchedWords.scoreCount,
    summarizedGame: matchedWords.summarizedGame,
    showFullText: setShowResponse,
  });

  const searchInput = SearchInput({
    requestedWord,
    isLoading: isScoreLoading,
    submitWord,
    onTextChange: setRequestedWord,
  });

  const makeRedactedMessages = (synopsis: ShadowWordsCloud): JSX.Element => {
    return (
      <Stack
        minHeight="100vh"
        height="100%"
        justifyContent="flex-start"
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="h2">! SYNOPTIX !</Typography>
        <StickyStack direction="column" spacing={2}>
          {searchInput}
          {hintsRow}
          {winPanel}
        </StickyStack>
        {content}
        <Footer />
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
