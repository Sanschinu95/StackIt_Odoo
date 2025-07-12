"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';

interface UserStats {
  questionsCount: number;
  answersCount: number;
}

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userStats, setUserStats] = useState<UserStats>({ questionsCount: 0, answersCount: 0 });

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session?.user?.id]);

  const fetchUserStats = async () => {
    try {
      const [questionsRes, answersRes] = await Promise.all([
        fetch(`/api/questions?userId=${session?.user?.id}`),
        fetch(`/api/answers?userId=${session?.user?.id}`)
      ]);
      
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setUserStats(prev => ({ ...prev, questionsCount: questionsData.questions?.length || 0 }));
      }
      
      if (answersRes.ok) {
        const answersData = await answersRes.json();
        setUserStats(prev => ({ ...prev, answersCount: answersData.answers?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    handleClose();
  };

  if (!session?.user) return null;

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 2,
          '&:hover': { background: '#23242b' }
        }}
      >
        {session.user.image ? (
          <Avatar src={session.user.image} sx={{ width: 32, height: 32 }} />
        ) : (
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2d7be5' }}>
            <PersonIcon />
          </Avatar>
        )}
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
          {session.user.name || session.user.email}
        </Typography>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            background: '#23242b',
            color: '#e0e0e0',
            minWidth: 200,
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            {session.user.name || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            {session.user.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleClose} sx={{ '&:hover': { background: '#181920' } }}>
          <Link href={`/profile/questions`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography>My Questions</Typography>
              <Typography variant="caption" sx={{ color: '#2d7be5' }}>
                {userStats.questionsCount}
              </Typography>
            </Box>
          </Link>
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ '&:hover': { background: '#181920' } }}>
          <Link href={`/profile/answers`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography>My Answers</Typography>
              <Typography variant="caption" sx={{ color: '#2d7be5' }}>
                {userStats.answersCount}
              </Typography>
            </Box>
          </Link>
        </MenuItem>
        
        {session.user.email === 'admin@stackit.com' && (
          <>
            <Divider sx={{ my: 1, borderColor: '#333' }} />
            <MenuItem onClick={handleClose} sx={{ '&:hover': { background: '#181920' } }}>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                  🤖 Admin Panel
                </Typography>
              </Link>
            </MenuItem>
          </>
        )}
        
        <Divider sx={{ my: 1, borderColor: '#333' }} />
        
        <MenuItem onClick={handleSignOut} sx={{ '&:hover': { background: '#181920' } }}>
          <Typography sx={{ color: '#ff6b6b' }}>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </>
  );
} 