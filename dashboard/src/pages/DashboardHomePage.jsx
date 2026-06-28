import ContactsIcon from '@mui/icons-material/Contacts';
import EmergencyIcon from '@mui/icons-material/Emergency';
import HistoryIcon from '@mui/icons-material/History';
import { useState } from 'react';
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';

import { EmergencyTable } from '../components/EmergencyTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusChip } from '../components/StatusChip';
import { SummaryCard } from '../components/SummaryCard';
import { getApiErrorMessage } from '../services/apiClient';
import { createEmergency, createLocation, endEmergency } from '../services/emergencyService';
import { createContact } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatDateTime, formatLocation } from '../utils/formatters';

export function DashboardHomePage() {
  const { user } = useAuth();
  const { activeEmergency, emergencies, error, isLoading, profile, reload } = useDashboardData();
  const [contactForm, setContactForm] = useState({
    email: '',
    name: '',
    phone: '',
    relationship: '',
  });
  const [locationForm, setLocationForm] = useState({
    accuracy: '25',
    latitude: '28.6139',
    longitude: '77.2090',
  });
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const buildLocationPayload = () => ({
    accuracy: Number(locationForm.accuracy),
    latitude: Number(locationForm.latitude),
    longitude: Number(locationForm.longitude),
    recordedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  });

  const runDashboardAction = async (successMessage, action) => {
    setActionError('');
    setActionSuccess('');
    setIsSubmittingAction(true);

    try {
      await action();
      await reload();
      setActionSuccess(successMessage);
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure, 'Dashboard action failed'));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleContactChange = (field) => (event) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleLocationChange = (field) => (event) => {
    setLocationForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    await runDashboardAction('Emergency contact added.', async () => {
      await createContact(contactForm);
      setContactForm({ email: '', name: '', phone: '', relationship: '' });
    });
  };

  const handleStartEmergency = () =>
    runDashboardAction('Emergency session started.', async () => {
      const locationPayload = buildLocationPayload();
      await createEmergency({
        accuracy: locationPayload.accuracy,
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        timestamp: locationPayload.timestamp,
      });
    });

  const handleSendLocation = () =>
    runDashboardAction('Location update sent.', async () => {
      await createLocation(activeEmergency.id, buildLocationPayload());
    });

  const handleEndEmergency = () =>
    runDashboardAction('Emergency session ended.', async () => {
      await endEmergency(activeEmergency.id);
    });

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
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}
      {actionSuccess ? <Alert severity="success">{actionSuccess}</Alert> : null}

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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            component="form"
            onSubmit={handleAddContact}
            sx={{ borderRadius: 1, p: 3 }}
            variant="outlined"
          >
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Emergency contacts
              </Typography>
              <TextField
                fullWidth
                label="Contact name"
                onChange={handleContactChange('name')}
                required
                value={contactForm.name}
              />
              <TextField
                fullWidth
                label="Phone"
                onChange={handleContactChange('phone')}
                value={contactForm.phone}
              />
              <TextField
                fullWidth
                label="Email"
                onChange={handleContactChange('email')}
                type="email"
                value={contactForm.email}
              />
              <TextField
                fullWidth
                label="Relationship"
                onChange={handleContactChange('relationship')}
                value={contactForm.relationship}
              />
              <Button disabled={isSubmittingAction} type="submit" variant="contained">
                Add contact
              </Button>
              {profile?.contacts?.length ? (
                <Stack spacing={1}>
                  {profile.contacts.map((contact) => (
                    <Typography key={contact.id} color="text.secondary" variant="body2">
                      {contact.name} {contact.relationship ? `(${contact.relationship})` : ''} ·{' '}
                      {[contact.phone, contact.email].filter(Boolean).join(' · ')}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <EmptyState message="No emergency contacts yet." />
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Emergency controls
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    onChange={handleLocationChange('latitude')}
                    type="number"
                    value={locationForm.latitude}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    onChange={handleLocationChange('longitude')}
                    type="number"
                    value={locationForm.longitude}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Accuracy"
                    onChange={handleLocationChange('accuracy')}
                    type="number"
                    value={locationForm.accuracy}
                  />
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  disabled={Boolean(activeEmergency) || isSubmittingAction}
                  onClick={handleStartEmergency}
                  variant="contained"
                >
                  Start emergency
                </Button>
                <Button
                  disabled={!activeEmergency || isSubmittingAction}
                  onClick={handleSendLocation}
                  variant="outlined"
                >
                  Send location
                </Button>
                <Button
                  color="error"
                  disabled={!activeEmergency || isSubmittingAction}
                  onClick={handleEndEmergency}
                  variant="outlined"
                >
                  End emergency
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
