"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Chip, TextField, InputAdornment, IconButton, Box, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

type FilterType = 'newest' | 'unanswered' | 'popular';

export default function HomePage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('newest');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filteredQuestions = [...questions];

    // Apply search filter
    if (search) {
      filteredQuestions = filteredQuestions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply tag filter
    if (tagFilter !== 'all') {
      filteredQuestions = filteredQuestions.filter((q) =>
        q.tags.includes(tagFilter)
      );
    }

    // Apply sort filter
    switch (activeFilter) {
      case 'newest':
        filteredQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'unanswered':
        filteredQuestions = filteredQuestions.filter(q => q.answers.length === 0);
        filteredQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filteredQuestions.sort((a, b) => b.answers.length - a.answers.length);
        break;
    }

    setFiltered(filteredQuestions);
  }, [search, questions, activeFilter, tagFilter]);

  // Get unique tags for filter dropdown
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags))).sort();

  // Upvote/downvote logic for questions
  const handleQuestionVote = async (questionId: string, type: 'up' | 'down') => {
    if (!session) return;
    setVoteLoading(questionId + type);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, type }),
      });
      if (response.ok) {
        const { question } = await response.json();
        setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, votes: question.votes, voters: question.voters } : q));
      }
    } finally {
      setVoteLoading(null);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Search and Filter Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
          variant="outlined"
          size="small"
          placeholder="Search questions or tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: '#b3b3b3' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 200, 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              background: '#23242b',
              color: '#e0e0e0',
              borderRadius: 8,
              '& fieldset': { borderColor: '#333' },
              '&:hover fieldset': { borderColor: '#2d7be5' },
              '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#b3b3b3',
              opacity: 1
            }
          }}
        />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#b3b3b3' }}>Tag Filter</InputLabel>
            <Select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              sx={{ 
                background: '#23242b', 
                color: '#e0e0e0',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2d7be5' },
                '& .MuiSelect-icon': { color: '#b3b3b3' }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    background: '#23242b',
                    '& .MuiMenuItem-root': {
                      color: '#e0e0e0',
                      '&:hover': { background: '#181920' },
                      '&.Mui-selected': { background: '#2d7be5' }
                    }
                  }
                }
              }}
            >
              <MenuItem value="all">All Tags</MenuItem>
              {allTags.map(tag => (
                <MenuItem key={tag} value={tag}>{tag}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant={activeFilter === 'newest' ? 'contained' : 'outlined'}
          onClick={() => setActiveFilter('newest')}
          style={{
            background: activeFilter === 'newest' ? '#2d7be5' : 'transparent',
            color: activeFilter === 'newest' ? '#fff' : '#2d7be5',
            borderColor: '#2d7be5',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          Newest
        </Button>
        <Button
          variant={activeFilter === 'unanswered' ? 'contained' : 'outlined'}
          onClick={() => setActiveFilter('unanswered')}
          style={{
            background: activeFilter === 'unanswered' ? '#2d7be5' : 'transparent',
            color: activeFilter === 'unanswered' ? '#fff' : '#2d7be5',
            borderColor: '#2d7be5',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          Unanswered
        </Button>
        <Button
          variant={activeFilter === 'popular' ? 'contained' : 'outlined'}
          onClick={() => setActiveFilter('popular')}
          style={{
            background: activeFilter === 'popular' ? '#2d7be5' : 'transparent',
            color: activeFilter === 'popular' ? '#fff' : '#2d7be5',
            borderColor: '#2d7be5',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          Most Popular
        </Button>
      </Box>

      {/* Ask New Question Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>
          {activeFilter === 'unanswered' ? 'Unanswered Questions' : 
           activeFilter === 'popular' ? 'Most Popular Questions' : 
           'All Questions'} ({filtered.length})
        </Typography>
        <Link href="/ask">
          <Button variant="contained" style={{ background: '#2d7be5', color: '#fff', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Ask New Question
          </Button>
        </Link>
      </Box>

      {/* Questions List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress sx={{ color: '#2d7be5' }} />
        </Box>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {filtered.length === 0 && (
          <div style={{ color: '#b3b3b3', textAlign: 'center', marginTop: 48 }}>
            {search || tagFilter !== 'all' ? 'No questions match your filters.' : 
             activeFilter === 'unanswered' ? 'No unanswered questions.' : 'No questions found.'}
          </div>
        )}
        {filtered.map((q) => (
          <Box key={q._id} sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', background: '#181920', borderRadius: 2, p: 2, boxShadow: '0 1px 8px #0002' }}>
            {/* Vote buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mb: 1, '&:hover': { borderColor: '#1e5bb8' } }}
                onClick={e => { e.preventDefault(); handleQuestionVote(q._id, 'up'); }}
                disabled={q.voters?.includes(session?.user?.id) || voteLoading === q._id + 'up'}
              >
                ▲
              </Button>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>{q.votes || 0}</Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mt: 1, '&:hover': { borderColor: '#1e5bb8' } }}
                onClick={e => { e.preventDefault(); handleQuestionVote(q._id, 'down'); }}
                disabled={q.voters?.includes(session?.user?.id) || voteLoading === q._id + 'down'}
              >
                ▼
              </Button>
            </Box>

            {/* Question content */}
            <Box sx={{ flex: 1 }}>
              <Link href={`/question/${q._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1, '&:hover': { color: '#2d7be5' } }}>
                  {q.title}
                </Typography>
              </Link>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {q.tags.map((tag: string) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: '#2d7be5',
                      color: '#fff',
                      fontSize: '0.75rem',
                      height: 24,
                      '&:hover': { background: '#1e5bb8' }
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', color: '#b3b3b3', fontSize: '0.875rem' }}>
                <span>Asked by {q.author?.name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{q.answers?.length || 0} answers</span>
              </Box>
            </Box>
          </Box>
        ))}
      </div>
      )}
    </div>
  );
}
