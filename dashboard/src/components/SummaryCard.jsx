import { Card, CardContent, Stack, Typography } from '@mui/material';

export function SummaryCard({ icon, label, value }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1, height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {icon}
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
        </Stack>
        <Typography component="p" sx={{ mt: 1.5, fontWeight: 700 }} variant="h5">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
