import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { ShadowWord, WordsDictionary } from "../models/Word";

const saveCache = (state: WordsDictionary): void => {
  window.localStorage.setItem("game", JSON.stringify(state));
};
const loadCache = (): WordsDictionary => {
  try {
    const cachedGame = window.localStorage.getItem("game") || null;
    if (cachedGame == null) {
      throw new Error("invalidate cache");
    }
    const game: WordsDictionary = JSON.parse(cachedGame);
    game.currentShadowWords = {};
    return game;
  } catch (error) {
    return {
      userID: uuid(),
      gameID: -1,
      summarizedGame: "",
      summary: { found: 0, near: 0, total: 0 },
      lastMovie: "",
      response: [],
      foundScore: -1,
      lastWord: "",
      currentShadowWords: {},
      allShadowWords: {},
      foundBy: 0,
      lastWords: [],
    };
  }
};

const initialState: WordsDictionary = loadCache();

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGame: (
      state: WordsDictionary,
      action: PayloadAction<Partial<WordsDictionary>>
    ) => {
      const newState = { ...state, ...action.payload };
      saveCache(newState);
      return newState;
    },
    winGame: (state: WordsDictionary) => {
      const newState = { ...state, foundScore: state.foundBy };
      saveCache(newState);
      return newState;
    },
    updateLastWords: (
      state: WordsDictionary,
      action: PayloadAction<{
        word: string;
        matchCount: number;
        nearCount: number;
      }>
    ) => {
      const { word, matchCount, nearCount } = action.payload;
      if (word === "") {
        return state;
      }
      const index = state.lastWords.map((w) => w.label).indexOf(word);
      if (index === -1) {
        const newLastWords = [
          ...state.lastWords,
          {
            index: state.lastWords.length + 1,
            label: word,
            matchCount,
            nearCount,
          },
        ];
        const newState = {
          ...state,
          lastWords: newLastWords,
        };
        saveCache(newState);
        return newState;
      }
      return state;
    },
    updateShadowWord: (
      state: WordsDictionary,
      action: PayloadAction<ShadowWord[]>
    ) => {
      const currentShadowWords = action.payload.reduce<
        Record<number, ShadowWord>
      >((acc, w) => {
        const existingShadowWord = state.allShadowWords[w.id];
        if (
          w.similarity === 1 ||
          !existingShadowWord ||
          existingShadowWord.similarity < w.similarity
        ) {
          acc[w.id] = w;
        }
        return acc;
      }, {});
      const newAllShadowWords = {
        ...state.allShadowWords,
        ...action.payload
          .filter((w) => {
            const foundPrevious = state.allShadowWords[w.id];
            return !foundPrevious || foundPrevious.similarity < w.similarity;
          })
          .reduce<Record<number, ShadowWord>>((acc, w) => {
            acc[w.id] = w;
            return acc;
          }, {}),
      };
      const newState = {
        ...state,
        currentShadowWords,
        allShadowWords: newAllShadowWords,
      };
      saveCache(newState);
      return newState;
    },
    resetGame: (state: WordsDictionary) => {
      const newState = {
        ...state,
        gameID: -1,
        summarizedGame: "",
        response: [],
        foundScore: -1,
        currentShadowWords: {},
        allShadowWords: {},
        foundBy: 0,
        lastWords: [],
      };
      saveCache(newState);
      return newState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateGame,
  winGame,
  resetGame,
  updateShadowWord,
  updateLastWords,
} = gameSlice.actions;

export default gameSlice.reducer;
