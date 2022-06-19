import { ShadowWord } from "./Word";

export interface ScoreRequest {
  word: string;
  wordIDs: number[];
}

export interface ScoreResponse {
  score: ShadowWord[];
  foundBy: number;
}
