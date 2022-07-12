import React, { useState, useEffect, useMemo } from "react";
import { RedactedGame, replaceWords, ShadowWordsCloud } from "./models/Word";
import {
  Box,
  Grid,
  GridProps,
  LinearProgress,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useGetRequest } from "./hooks/useGetRequest";
import { usePostRequest } from "./hooks/usePostRequest";
import { ScoreRequest, ScoreResponse } from "./models/Request";
import Footer from "./components/Footer";
import Hints from "./components/Hints";
import ObfuscatedText from "./components/ObfuscatedText";
import WinPanel from "./components/WinPanel";
import { makeSummary, summarizedGame } from "./utils/text";
import SearchInput from "./components/SearchInput";
import { useAppDispatch, useAppSelector } from "./hooks/useRedux";
import { updateGame, updateShadowWord, winGame } from "./redux/gameSlice";
import GameInfo from "./components/GameInfo";
import SynoptixAppBar from "./components/SynoptixAppBar";
import Rules from "./components/rules";

const GET_UPDATE_STATUS_URL = process.env.REACT_APP_GET_UPDATE_STATUS_URL || "";
const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || "";
const POST_SCORE_FOR_WORD_URL =
  process.env.REACT_APP_POST_SCORE_FOR_WORD_URL || "";

const loadCache = (): void => {
  if (window.localStorage.getItem("gameID") !== null) {
    window.localStorage.clear();
  }
};

const StickyGrid = styled(Grid)<GridProps>(({ theme }) => ({
  width: "800px",
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
  const {
    gameID,
    allShadowWords,
    response,
    currentShadowWords,
    foundScore,
    userID,
  } = useAppSelector((state) => state.game);
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState<ShadowWordsCloud>([]);
  const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([]);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [game, gameRequest, isGameLoading] =
    useGetRequest<RedactedGame>(GET_CURRENT_GAME_URL);
  const [update, updateRequest] = useGetRequest<RedactedGame>(
    GET_UPDATE_STATUS_URL
  );
  const [score, scoreRequest, isScoreLoading] = usePostRequest<
    ScoreRequest,
    ScoreResponse
  >(POST_SCORE_FOR_WORD_URL);
  const fullText = useMemo(() => [...title, ...synopsis], [title, synopsis]);

  useEffect(() => {
    loadCache();
  }, []);

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
    if (update) {
      if (update.gameID !== gameID) {
        gameRequest();
      } else {
        dispatch(updateGame({ foundBy: update.foundBy }));
      }
    }
  }, [gameRequest, gameID, update, dispatch]);

  useEffect(() => {
    if (game) {
      setTitle(
        game.redactedTitle.map((c) => c.map(replaceWords(allShadowWords)))
      );
      setSynopsis(
        game.redactedSynopsis.map((c) => c.map(replaceWords(allShadowWords)))
      );
      if (game.gameID !== gameID) {
        dispatch(
          updateGame({
            foundScore: -1,
            summarizedGame: "",
            response: [],
            gameNumber: game.gameNumber,
            lastMovie: game.lastMovie,
            gameID: game.gameID,
            currentShadowWords: {},
            allShadowWords: {},
            foundBy: game.foundBy,
            lastWord: "",
            lastWords: [],
          })
        );
      }
    }
  }, [game, allShadowWords, gameID, dispatch]);

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
        synopsis: response,
        currentShadowWords: currentShadowWords,
      });
    }

    return ObfuscatedText({
      title,
      synopsis,
      currentShadowWords: currentShadowWords,
    });
  }, [
    currentShadowWords,
    isGameLoading,
    response,
    showResponse,
    synopsis,
    title,
  ]);

  useEffect(() => {
    if (
      foundScore === -1 &&
      title.length > 0 &&
      title.every((row) => {
        return row.every((s) => s.similarity === 1);
      })
    ) {
      dispatch(winGame());
    }
  }, [foundScore, dispatch, title]);

  useEffect(() => {
    if (score) {
      const { score: newScore, foundBy, response = [] } = score;

      dispatch(
        updateGame({
          foundBy,
          response,
        })
      );
      dispatch(updateShadowWord(newScore));
    }
  }, [dispatch, score]);

  useEffect(() => {
    setTitle((previous) =>
      previous.map((row) => row.map(replaceWords(allShadowWords)))
    );

    setSynopsis((previous) =>
      previous.map((row) => row.map(replaceWords(allShadowWords)))
    );
  }, [allShadowWords]);

  useEffect(() => {
    if (foundScore === -1) {
      dispatch(
        updateGame({
          summarizedGame: summarizedGame(fullText),
          summary: makeSummary(fullText),
        })
      );
    }
  }, [dispatch, foundScore, fullText]);

  const hintsRow = Hints({
    text: fullText,
    isScoreLoading,
  });

  const foundTitle =
    !isGameLoading &&
    title.length > 0 &&
    title.every((row) => {
      return row.every((s) => s.similarity === 1);
    });
  const winPanel = WinPanel({
    foundTitle,
    showFullText: setShowResponse,
  });

  const submitWord = async (requestedWord: string) => {
    const trimmedWord = requestedWord.replace(" ", "");
    if (trimmedWord.length > 0) {
      const wordIDs = title
        .reduce((acc, curr) => [...acc, ...curr], [])
        .filter((w) => w.similarity === 1)
        .map((w) => w.id);
      await scoreRequest({ word: trimmedWord, wordIDs, userID });
      dispatch(updateGame({ lastWord: trimmedWord }));
    }
  };
  const searchInput = SearchInput({
    isLoading: isScoreLoading,
    submitWord,
  });

  return (
    <Box lineHeight="1.5" width="100%">
      <Rules />
      <Stack
        margin="auto"
        minHeight="100vh"
        height="100%"
        justifyContent="flex-start"
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <SynoptixAppBar />
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <GameInfo />
        </Box>
        <StickyGrid
          container
          justifyContent="center"
          alignItems="flex-start"
          rowSpacing={2}
          columnSpacing={1}
        >
          <Grid item sx={{ display: { xs: "none", sm: "block" } }} xs={4}>
            <GameInfo />
          </Grid>
          <Grid item xs={12} sm={6} md>
            {searchInput}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {hintsRow}
          </Grid>
          <Grid item xs={12}>
            {winPanel}
          </Grid>
        </StickyGrid>
        {content}
        <Footer />
      </Stack>
    </Box>
  );
};

export default App;
