import { Outlet, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';

import { useAuth } from '../hooks/useAuth';

export function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar color="inherit" elevation={0} position="sticky">
        <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexGrow: 1 }}>
            <ShieldIcon color="primary" />
            <Typography component="div" sx={{ fontWeight: 700 }} variant="h6">
              SafeGuard
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
              variant="body2"
            >
              {user?.name}
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
