import { amber, grey, lightGreen } from "@mui/material/colors";
import React from "react";
import { ShadowWordInterface } from "../models/Word";
import { tint } from "../utils/color";

interface ShadowWordProps extends React.ComponentProps<"span"> {
  word: ShadowWordInterface;
  isLastWord: boolean;
}

export const ShadowWordSpan = ({
  word,
  isLastWord,
}: ShadowWordProps): React.ReactElement => {
  const html_tag_regexp = /<\/?.?>/g;
  const isAnHTMLTag = word.closestWord.match(html_tag_regexp);
  if (isAnHTMLTag && isAnHTMLTag[0] === word.closestWord) {
    return <span dangerouslySetInnerHTML={{ __html: word.closestWord }} />;
  }
  const isSimilar = word.similarity === 1;
  const isLastWordSimilar = isSimilar && isLastWord;
  const style: React.CSSProperties = {
    fontFamily: '"DejaVu Mono", monospace',
    fontWeight: "700",
    borderRadius: "3px",
    backgroundColor: isLastWordSimilar
      ? lightGreen["A400"]
      : isSimilar
      ? "transparent"
      : "#333",
    color: isSimilar
      ? "black"
      : isLastWord
      ? tint(amber, word.similarity)
      : tint(grey, 1.5 - Math.max(word.similarity, 0.7)),
    // width: `${word.shadowWord.length * 10}px`,
    whiteSpace: "pre",
    padding: isSimilar && !isLastWordSimilar ? "0" : "2px 5px",
    // margin: isSimilar ? "inherit" : "0 1px",
    display: "inline-block",
    textAlign: "center",
    fontSize: "1em",
    lineHeight: "1",
    // height: "20px",
    transitionProperty: "background-color, color",
    transitionDuration: ".5s",
    transitionTimingFunction: "linear",
  };
  if (isSimilar) {
    return <span style={style}>{word.closestWord}</span>;
  } else {
    const missingSpacing = word.shadowWord.length - word.closestWord.length;
    if (missingSpacing > 0) {
      const leadingSpaces = word.shadowWord.slice(
        0,
        Math.ceil(missingSpacing / 2)
      );
      const trailingSpaces = word.shadowWord.slice(
        0,
        Math.floor(missingSpacing / 2)
      );
      return (
        <span
          style={style}
        >{`${leadingSpaces}${word.closestWord}${trailingSpaces}`}</span>
      );
    }
    return <span style={style}>{word.closestWord}</span>;
  }
};
