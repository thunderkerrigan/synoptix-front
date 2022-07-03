import { ShadowWord, ShadowWordsCloud } from "./Word";

export interface MovieRequest {
  id: number;
  title: string;
  synopsis: string;
}

export interface ScoreRequest {
  userID: string;
  word: string;
  wordIDs: number[];
}

export interface ScoreResponse {
  score: ShadowWord[];
  foundBy: number;
  response?: ShadowWordsCloud;
}
