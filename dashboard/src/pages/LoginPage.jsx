import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

import { getApiErrorMessage } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Unable to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ borderRadius: 1, maxWidth: 420, mx: 'auto', p: 4, width: '100%' }}
        variant="outlined"
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <ShieldIcon color="primary" fontSize="large" />
            <Typography component="h1" variant="h4">
              SafeGuard Dashboard
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Sign in to review emergency sessions, location history, and evidence.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            autoComplete="email"
            fullWidth
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            fullWidth
            label="Password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <Button disabled={isSubmitting} fullWidth type="submit" variant="contained">
            {isSubmitting ? 'Signing in' : 'Sign in'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
