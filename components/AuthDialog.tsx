import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'register') {
        // Register first
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
      }
      
      // Then sign in using NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      onAuthSuccess?.();
      onClose();
    } catch (error) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          background: '#23242b',
          color: '#e0e0e0'
        }
      }}
    >
      <DialogTitle sx={{ color: '#fff' }}>{mode === 'login' ? 'Login' : 'Register'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {mode === 'register' && (
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#2d7be5' },
                  '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
                },
                '& .MuiInputLabel-root': {
                  color: '#b3b3b3',
                  '&.Mui-focused': { color: '#2d7be5' }
                }
              }}
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#2d7be5' },
                '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
              },
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': { color: '#2d7be5' }
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#2d7be5' },
                '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
              },
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': { color: '#2d7be5' }
              }
            }}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
            disabled={loading}
            sx={{ color: '#2d7be5' }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              background: '#2d7be5',
              '&:hover': { background: '#1e5bb8' }
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AuthDialog; 