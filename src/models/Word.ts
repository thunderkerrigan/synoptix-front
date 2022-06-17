import { Class } from '@mui/icons-material'

export interface ShadowWord {
    id: number
    closestWord: string
    shadowWord: string
    similarity: number
    isSimilar: (comparedWord: ShadowWord) => boolean
    isBetterFitted: (comparedWord: ShadowWord) => boolean
    isBetterFittedOrSimilar: (comparedWord: ShadowWord) => boolean
}

export class ShadowWord implements ShadowWord {
    id: number
    closestWord: string
    shadowWord: string
    similarity: number

    constructor(newWord: ShadowWord) {
        this.id = newWord.id
        this.closestWord = newWord.closestWord
        this.shadowWord = newWord.shadowWord
        this.similarity = newWord.similarity
    }
    isSimilar = (comparedWord: ShadowWord) => comparedWord.similarity === 1
    isBetterFitted = (comparedWord: ShadowWord) =>
        comparedWord.similarity < this.similarity
    isBetterFittedOrSimilar = (comparedWord: ShadowWord) =>
        this.isSimilar(comparedWord) || this.isBetterFitted(comparedWord)
}

export type Word = Record<string, number>

export type ShadowWordsCloud = ShadowWord[][]

export interface RedactedGame {
    gameID: number
    redactedTitle: ShadowWordsCloud
    redactedSynopsis: ShadowWordsCloud
}

export interface WordsDictionary {
    gameID: number
    currentShadowWords: Record<string, ShadowWord>
    allShadowWords: Record<string, ShadowWord>
}

export const replaceWords =
    (dictionaries: WordsDictionary) =>
    (s: ShadowWord): ShadowWord => {
        const comparedWord = dictionaries.currentShadowWords[s.id.toString()]
        if (comparedWord) {
            return comparedWord.isBetterFittedOrSimilar(s) ? comparedWord : s
        } else {
            const previousComparedWord =
                dictionaries.allShadowWords[s.id.toString()]
            if (previousComparedWord) {
                return previousComparedWord.isBetterFittedOrSimilar(s)
                    ? previousComparedWord
                    : s
            }
        }
        return s
    }
