"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Chip, Box, Typography } from "@mui/material";

export default function MyQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (session?.user?.id) {
      fetchQuestions();
    }
  }, [session, status, router]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions?userId=${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please login to view your questions.</div>;
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#fff' }}>
          My Questions ({questions.length})
        </Typography>
        <Link href="/ask">
          <Button variant="contained" style={{ background: '#2d7be5', color: '#fff' }}>
            Ask New Question
          </Button>
        </Link>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {questions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 2 }}>
              You haven't asked any questions yet
            </Typography>
            <Link href="/ask">
              <Button variant="contained" style={{ background: '#2d7be5', color: '#fff' }}>
                Ask Your First Question
              </Button>
            </Link>
          </Box>
        ) : (
          questions.map((q) => (
            <Link key={q._id} href={`/question/${q._id}`} style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                background: '#181920', 
                borderRadius: 2, 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { background: '#23242b' }
              }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                  {q.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {q.tags.map((tag: string) => (
                    <Chip key={tag} label={tag} size="small" style={{ background: '#23242b', color: '#b3b3b3' }} />
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                  {new Date(q.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2d7be5' }}>
                  {q.answers.length} Answers
                </Typography>
              </Box>
            </Link>
          ))
        )}
      </Box>
    </div>
  );
} 