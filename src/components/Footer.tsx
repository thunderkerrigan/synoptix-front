import { Link, Typography } from "@mui/material";
import React from "react";

const Footer = () => {
  return (
    <p>
      <Typography variant="caption">{"Rédigé par "}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://twitter.com/thunderkerrigan"
      >
        {"thunderkerrigan"}
      </Link>
      <Typography variant="caption"> {" & "} </Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://twitter.com/Gonzo_Oin"
      >
        {"gonzo-oin"}
      </Link>
      <Typography variant="caption">{". Inspiré de "}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://cemantix.herokuapp.com/pedantix"
      >
        {"pedantix"}
      </Link>
      <Typography variant="caption">{" par "}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://twitter.com/enigmathix"
      >
        {"enigmatix"}
      </Link>
      <Typography variant="caption">{". Données de  "}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://fauconnier.github.io/#data"
      >
        {"Jean-Philippe Fauconnier"}
      </Link>
      <Typography variant="caption">{" et "}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        color="inherit"
        variant="caption"
        href="https://fr.wikipedia.org/"
      >
        {"Wikipedia"}
      </Link>
      <Typography variant="caption">{"."}</Typography>
    </p>
  );
};

export default Footer;
