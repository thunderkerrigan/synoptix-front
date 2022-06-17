import React, {
    useState,
    useEffect,
    Fragment,
    KeyboardEvent,
    useMemo,
} from 'react'
import './App.css'
import {
    RedactedGame,
    replaceWords,
    ShadowWord,
    ShadowWordsCloud,
    WordsDictionary,
} from './models/Word'
import axios from 'axios'
import { Box, Collapse, Stack, TextField, Typography } from '@mui/material'
// import parse from "html-react-parser";

const GET_CURRENT_GAME_URL = process.env.REACT_APP_GET_CURRENT_GAME_URL || ''
const GET_SCORE_FOR_WORD_URL =
    process.env.REACT_APP_GET_SCORE_FOR_WORD_URL || ''

interface ShadowWordProps extends React.ComponentProps<'span'> {
    word: ShadowWord
    lastWord: string
}

const ShadowWordSpan = ({ word, lastWord }: ShadowWordProps) => {
    const html_tag_regexp = /<\/?.?>/g
    const isAnHTMLTag = word.closestWord.match(html_tag_regexp)
    if (isAnHTMLTag && isAnHTMLTag[0] === word.closestWord) {
        return <span dangerouslySetInnerHTML={{ __html: word.closestWord }} />
    }
    const isSimilar = word.similarity === 1
    const isLastWord =
        word.closestWord.toLocaleLowerCase() === lastWord.toLocaleLowerCase()
    const style: React.CSSProperties = {
        fontFamily: 'monospace',
        borderRadius: '3px',
        backgroundColor: isSimilar ? 'transparent' : '#333',
        color: isSimilar ? 'black' : isLastWord ? 'orange' : 'grey',
        // width: `${word.shadowWord.length * 10}px`,
        whiteSpace: 'pre',
        padding: isSimilar ? '0' : '0 3px',
        // margin: isSimilar ? "inherit" : "0 1px",
        display: 'inline-block',
        textAlign: 'center',
        fontSize: '1.2em',
        lineHeight: '1.2',
        // height: "20px",
        transitionProperty: 'background-color, color',
        transitionDuration: '.5s',
        transitionTimingFunction: 'linear',
    }
    const text =
        word.closestWord.length > 0
            ? word.closestWord.toString()
            : word.shadowWord

    return <span style={style}>{text}</span>
}

const loadCache = (): WordsDictionary => {
    const cacheMatchedWords =
        window.localStorage.getItem('matchedWords') || '{}'
    const cacheGameID = window.localStorage.getItem('gameID') || '-1'
    const gameID = parseInt(cacheGameID)
    const allShadowWordsRaw = JSON.parse(cacheMatchedWords)
    const allShadowWords = Object.entries<ShadowWord>(allShadowWordsRaw).reduce<
        Record<string, ShadowWord>
    >((acc, [key, value]) => {
        acc[key] = new ShadowWord(value)
        return acc
    }, {})

    return { gameID, currentShadowWords: {}, allShadowWords }
}

const App = () => {
    const [title, setTitle] = useState<ShadowWordsCloud>([])
    const [synopsis, setSynopsis] = useState<ShadowWordsCloud>([])
    const [matchedWords, setMatchedWords] = useState<WordsDictionary>(
        loadCache()
    )
    const [hintsRow, setHintsRow] = useState<React.ReactElement>(<Fragment />)
    const [lastWord, setLastWord] = useState<string>('')
    const [requestedWord, setRequestedWord] = useState<string>('')
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get<RedactedGame>(GET_CURRENT_GAME_URL)
            if (response.status === 200) {
                setTitle(
                    response.data.redactedTitle.map((c) =>
                        c
                            .map((w) => new ShadowWord(w))
                            .map(replaceWords(matchedWords))
                    )
                )
                setSynopsis(
                    response.data.redactedSynopsis.map((c) =>
                        c
                            .map((w) => new ShadowWord(w))
                            .map(replaceWords(matchedWords))
                    )
                )
            }
            if (response.data.gameID !== matchedWords.gameID) {
                setMatchedWords({
                    gameID: response.data.gameID,
                    currentShadowWords: {},
                    allShadowWords: {},
                })
            }
        }
        fetchData()
        return () => {
            console.log('cleanup')
        }
    }, [matchedWords])

    useEffect(() => {
        console.log('save matchedWords')
        localStorage.setItem(
            'matchedWords',
            JSON.stringify(matchedWords.allShadowWords)
        )
        localStorage.setItem('gameID', JSON.stringify(matchedWords.gameID))
    }, [matchedWords])

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
                            )
                        })}
                    </p>
                </h1>
            )
        })
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
                        )
                    })}
                </p>
            )
        })
        return (
            <Box
                sx={{
                    margin: '0 auto',
                    width: '90%',
                    alignContent: 'center',
                    display: 'block',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    boxShadow: 'inset 0px 0px 4px black',
                    padding: '5px',
                    overflow: 'auto',
                }}>
                {newTitleContent}
                {newSynopsisContent}
            </Box>
        )
    }, [lastWord, synopsis, title])

    const submitWord = async () => {
        console.log('start submitWord:')
        const { data: scoredWords } = await axios.get<ShadowWord[]>(
            `${GET_SCORE_FOR_WORD_URL}${requestedWord}`
        )

        setLastWord(requestedWord)
        setRequestedWord('')
        setMatchedWords((prev) => {
            return {
                gameID: prev.gameID,
                currentShadowWords: scoredWords.reduce<
                    Record<number, ShadowWord>
                >((acc, w) => {
                    acc[w.id] = new ShadowWord(w)
                    return acc
                }, {}),
                allShadowWords: {
                    ...prev.allShadowWords,
                    ...scoredWords
                        .filter((w) => {
                            const foundPrevious = prev.allShadowWords[w.id]
                            return (
                                !foundPrevious ||
                                foundPrevious.similarity < w.similarity
                            )
                        })
                        .reduce<Record<number, ShadowWord>>((acc, w) => {
                            acc[w.id] = new ShadowWord(w)
                            return acc
                        }, {}),
                },
            }
        })
        console.log('end submitWord:')
    }
    useEffect(() => {
        console.log(
            `################################################################################`
        )
        setTitle((previous) =>
            previous.map((row) => row.map(replaceWords(matchedWords)))
        )
        setSynopsis((previous) =>
            previous.map((row) => row.map(replaceWords(matchedWords)))
        )
        console.log(
            `################################################################################`
        )
    }, [matchedWords])

    useEffect(() => {
        setHintsRow(() => {
            // const wordsIDs = matchedWords.currentShadowWords.map((w) => w.id)
            let newMatchedHints = ''
            let newNearHints = ''
            ;[...title, ...synopsis].forEach((row) => {
                row.forEach((s) => {
                    const matchedWord =
                        matchedWords.currentShadowWords[s.id.toString()]
                    if (matchedWord && matchedWord.isBetterFittedOrSimilar(s)) {
                        if (matchedWord.isSimilar(s)) {
                            newMatchedHints += '🟩'
                        } else {
                            newNearHints += '🟧'
                        }
                    }
                })
            })

            let fullHintsRow = newMatchedHints + newNearHints
            if (fullHintsRow.length === 0) {
                fullHintsRow = '🟥'
            }
            return <span>{`${lastWord}: ${fullHintsRow}`}</span>
        })
    }, [matchedWords, lastWord, title, synopsis])

    const makeRedactedMessages = (synopsis: ShadowWordsCloud): JSX.Element => {
        if (synopsis.length === 0) {
            return <div>Loading...</div>
        }
        const handleKeyboardEvent = (e: KeyboardEvent<HTMLImageElement>) => {
            // console.log("key:", e.key);
            e.key === 'Enter' && submitWord()
        }

        const handleScoreTextfieldChange = (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {
            setRequestedWord(event.target.value)
        }
        const foundTitle = title.every((row) => {
            return row.every((s) => s.similarity === 1)
        })
        return (
            <Stack
                sx={{
                    // backgroundColor: ,
                    height: '100%',
                }}
                justifyContent='flex-start'
                direction='column'
                alignItems='center'
                spacing={2}>
                <Typography variant='h1'>! SYNOPTIX !</Typography>

                <Box>
                    <TextField
                        // inputProps={{ class backgroundColor: 'white' }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                boxShadow: 'inset 0px 0px 4px black',
                            },
                        }}
                        label='Enter a word'
                        id='score-id'
                        value={requestedWord}
                        onChange={handleScoreTextfieldChange}
                        onKeyUp={handleKeyboardEvent}
                    />
                </Box>
                <Collapse in={foundTitle}>
                    <Box
                        sx={{
                            backgroundColor: 'lime',
                            padding: 1,
                            borderRadius: '5px',
                        }}>
                        <h1>BRAVO</h1>
                    </Box>
                </Collapse>
                {hintsRow}
                {content}
            </Stack>
        )
    }
    return (
        <Box lineHeight='1.5' width='100%'>
            {makeRedactedMessages(synopsis)}
        </Box>
    )
}

export default App
