import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetRequest } from "./hooks/useGetRequest";

const ADMIN_GET_AUTH_LOGIN_URL =
  process.env.REACT_APP_ADMIN_GET_AUTH_LOGIN_URL || "";

const Login = () => {
  const location = useLocation();
  const [adminToken, tryConnection, isLoading] = useGetRequest<string>(
    ADMIN_GET_AUTH_LOGIN_URL
  );
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const login = data.get("username")?.toString() || "";
    const password = data.get("password")?.toString() || "";
    tryConnection(undefined, { username: login, password: password });
  };

  if (adminToken) {
    localStorage.setItem("synoptix-admin-token", adminToken);
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  return (
    <Box
      sx={{
        // marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Authentification
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Utilisateur"
          name="username"
          autoComplete="username"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mot de passe"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Se Connecter
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
