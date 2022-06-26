import { Box } from "@mui/material";
import React from "react";
import { ShadowWord, ShadowWordsCloud } from "../models/Word";
import { ShadowWordSpan } from "./ShadowWordSpan";

const boxStyle = {
  margin: "0 auto",
  width: "90%",
  alignContent: "center",
  display: "block",
  backgroundColor: "white",
  borderRadius: "5px",
  boxShadow: "inset 0px 0px 4px black",
  padding: "5px",
  overflow: "auto",
};

interface ObfuscatedTextProps {
  title: ShadowWordsCloud;
  synopsis: ShadowWordsCloud;
  currentShadowWords: Record<string, ShadowWord>;
}

const ObfuscatedText = (props: ObfuscatedTextProps) => {
  const { title, synopsis, currentShadowWords } = props;
  const latestWordIDs = Object.keys(currentShadowWords);
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
              isLastWord={latestWordIDs.some((id) => id === word.id.toString())}
            />
          );
        })}
      </p>
    );
  });
  return (
    <Box sx={boxStyle}>
      {newTitleContent}
      {newSynopsisContent}
    </Box>
  );
};

export default ObfuscatedText;
