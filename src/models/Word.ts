export interface ShadowWordInterface {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
}

export interface ShadowWord extends ShadowWordInterface {
  isSimilar: (comparedWord: ShadowWord) => boolean;
  isBetterFitted: (comparedWord: ShadowWord) => boolean;
  isBetterFittedOrSimilar: (comparedWord: ShadowWord) => boolean;
}

export class ShadowWord implements ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;

  constructor(newWord: ShadowWordInterface) {
    this.id = newWord.id;
    this.closestWord = newWord.closestWord;
    this.shadowWord = newWord.shadowWord;
    this.similarity = newWord.similarity;
  }
  isSimilar = (comparedWord: ShadowWord) =>
    this.similarity === comparedWord.similarity;
  isBetterFitted = (comparedWord: ShadowWord) =>
    this.similarity > comparedWord.similarity;
  isBetterFittedOrSimilar = (comparedWord: ShadowWord) =>
    this.similarity === 1 ||
    this.isSimilar(comparedWord) ||
    this.isBetterFitted(comparedWord);
}

export type Word = Record<string, number>;

export type ShadowWordsCloud = ShadowWordInterface[][];

export interface RedactedGame {
  gameID: number;
  foundBy: number;
  lastMovie: string;
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
}

export interface LastWord {
  index: number;
  label: string;
  matchCount: number;
  nearCount: number;
}

export interface WordsDictionary {
  userID: string;
  gameID: number;
  foundScore: number;
  response: ShadowWordsCloud;
  lastMovie: string;
  summarizedGame: string;
  summary: { found: number; near: number; total: number };
  lastWord: string;
  currentShadowWords: Record<string, ShadowWordInterface>;
  allShadowWords: Record<string, ShadowWordInterface>;
  foundBy: number;
  lastWords: LastWord[];
}

export const replaceWords =
  (allShadowWords: Record<string, ShadowWordInterface>) =>
  (s: ShadowWordInterface): ShadowWordInterface => {
    const comparingWord = new ShadowWord(s);
    const comparedWordInterface = allShadowWords[s.id.toString()];

    if (comparedWordInterface) {
      const comparedWord = new ShadowWord(comparedWordInterface);
      if (comparedWord.isBetterFittedOrSimilar(comparingWord)) {
        return comparedWordInterface;
      } else {
        return s;
      }
    }
    return s;
  };
