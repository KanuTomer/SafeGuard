import { useCallback } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Button, Grid, Paper, Stack, Typography } from '@mui/material';

import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EvidenceList } from '../components/EvidenceList';
import { LoadingState } from '../components/LoadingState';
import { LocationList } from '../components/LocationList';
import { StatusChip } from '../components/StatusChip';
import { SummaryCard } from '../components/SummaryCard';
import { useEmergencyDetail } from '../hooks/useEmergencyDetail';
import { useEmergencySocket } from '../hooks/useEmergencySocket';
import { formatDateTime, formatLocation } from '../utils/formatters';

export function EmergencyDetailPage() {
  const { emergencyId } = useParams();
  const { addRealtimeLocation, emergency, error, evidence, isLoading, locations } =
    useEmergencyDetail(emergencyId);
  const handleLocationCreated = useCallback(
    (location) => {
      addRealtimeLocation(location);
    },
    [addRealtimeLocation]
  );
  const { socketError } = useEmergencySocket(emergencyId, handleLocationCreated);

  if (isLoading) {
    return <LoadingState message="Loading emergency details" />;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/dashboard">
          Back to dashboard
        </Button>
        <ErrorAlert message={error} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to="/dashboard"
      >
        Back to dashboard
      </Button>

      {socketError ? <Alert severity="warning">{socketError}</Alert> : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Typography component="h1" sx={{ flexGrow: 1 }} variant="h4">
          Emergency details
        </Typography>
        <StatusChip status={emergency.status} />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Started" value={formatDateTime(emergency.startedAt)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            label="Ended"
            value={emergency.endedAt ? formatDateTime(emergency.endedAt) : 'Still active'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            label="Last known location"
            value={formatLocation(emergency.lastKnownLocation)}
          />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Contacts snapshot
          </Typography>
          {emergency.contactsSnapshot.length > 0 ? (
            <Stack spacing={1}>
              {emergency.contactsSnapshot.map((contact, index) => (
                <Typography
                  key={`${contact.email}-${contact.phone}-${index}`}
                  color="text.secondary"
                  variant="body2"
                >
                  {contact.name} {contact.relationship ? `(${contact.relationship})` : ''} ·{' '}
                  {[contact.phone, contact.email].filter(Boolean).join(' · ')}
                </Typography>
              ))}
            </Stack>
          ) : (
            <EmptyState message="No emergency contacts were snapshotted for this session." />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Location history
          </Typography>
          {locations.length > 0 ? (
            <LocationList locations={locations} />
          ) : (
            <EmptyState message="No location points have been recorded for this emergency." />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Evidence
          </Typography>
          {evidence.length > 0 ? (
            <EvidenceList evidence={evidence} />
          ) : (
            <EmptyState message="No evidence has been uploaded for this emergency." />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
