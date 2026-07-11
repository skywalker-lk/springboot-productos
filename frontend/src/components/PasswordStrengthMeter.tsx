import { Box, LinearProgress, Typography } from '@mui/material';

function calcularFortaleza(pw: string): {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
} {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;

  if (score <= 1) return { score, label: 'Débil', color: 'error' };
  if (score === 2) return { score, label: 'Regular', color: 'warning' };
  if (score <= 3) return { score, label: 'Buena', color: 'info' };
  return { score: 4, label: 'Fuerte', color: 'success' };
}

interface Props {
  password: string;
}

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { score, label, color } = calcularFortaleza(password);
  const value = (score / 4) * 100;

  return (
    <Box sx={{ mt: 0.5, mb: 1 }}>
      <LinearProgress variant="determinate" value={value} color={color} />
      <Typography variant="caption" color={`${color}.main`} sx={{ mt: 0.25, display: 'block' }}>
        Fortaleza: {label}
      </Typography>
    </Box>
  );
}
