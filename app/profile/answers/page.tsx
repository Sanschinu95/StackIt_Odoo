"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Box, Typography } from "@mui/material";
import dynamic from "next/dynamic";

const EditorOutput = dynamic(() => import("@/components/EditorOutput"), { ssr: false });

export default function MyAnswersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (session?.user?.id) {
      fetchAnswers();
    }
  }, [session, status, router]);

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/answers?userId=${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please login to view your answers.</div>;
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#fff' }}>
          My Answers ({answers.length})
        </Typography>
        <Link href="/">
          <Button variant="contained" style={{ background: '#2d7be5', color: '#fff' }}>
            Browse Questions
          </Button>
        </Link>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {answers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 2 }}>
              You haven't answered any questions yet
            </Typography>
            <Link href="/">
              <Button variant="contained" style={{ background: '#2d7be5', color: '#fff' }}>
                Browse Questions to Answer
              </Button>
            </Link>
          </Box>
        ) : (
          answers.map((answer) => (
            <Box key={answer._id} sx={{ 
              background: '#181920', 
              borderRadius: 2, 
              p: 3,
              border: '1px solid #333'
            }}>
              <Link href={`/question/${answer.question._id}`} style={{ textDecoration: 'none' }}>
                <Typography variant="h6" sx={{ color: '#2d7be5', mb: 2, cursor: 'pointer' }}>
                  {answer.question.title}
                </Typography>
              </Link>
              
              <Box sx={{ mb: 2 }}>
                <EditorOutput data={JSON.parse(answer.content)} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  {new Date(answer.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2d7be5' }}>
                  {answer.votes || 0} upvotes
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </div>
  );
} 