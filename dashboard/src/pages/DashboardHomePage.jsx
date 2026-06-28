import ContactsIcon from '@mui/icons-material/Contacts';
import EmergencyIcon from '@mui/icons-material/Emergency';
import HistoryIcon from '@mui/icons-material/History';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

import { EmergencyTable } from '../components/EmergencyTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusChip } from '../components/StatusChip';
import { SummaryCard } from '../components/SummaryCard';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatDateTime, formatLocation } from '../utils/formatters';

export function DashboardHomePage() {
  const { user } = useAuth();
  const { activeEmergency, emergencies, error, isLoading, profile } = useDashboardData();

  if (isLoading) {
    return <LoadingState message="Loading dashboard" />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Dashboard
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Review your emergency activity and supporting evidence.
        </Typography>
      </Box>

      <ErrorAlert message={error} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<EmergencyIcon color={activeEmergency ? 'error' : 'disabled'} />}
            label="Active emergency"
            value={activeEmergency ? 'In progress' : 'None'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<HistoryIcon color="primary" />}
            label="Total sessions"
            value={emergencies.length}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<ContactsIcon color="primary" />}
            label="Emergency contacts"
            value={profile?.contacts?.length ?? 0}
          />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Typography component="h2" sx={{ flexGrow: 1 }} variant="h6">
              Active session
            </Typography>
            {activeEmergency ? <StatusChip status={activeEmergency.status} /> : null}
          </Stack>
          {activeEmergency ? (
            <Typography color="text.secondary" variant="body2">
              {user?.name ? `${user.name}, this session started ` : 'Started '}
              {formatDateTime(activeEmergency.startedAt)}. Last known location:{' '}
              {formatLocation(activeEmergency.lastKnownLocation)}.
            </Typography>
          ) : (
            <EmptyState message="No active emergency session." />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Emergency history
          </Typography>
          {emergencies.length > 0 ? (
            <EmergencyTable emergencies={emergencies} />
          ) : (
            <EmptyState message="No emergency sessions have been created yet." />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
