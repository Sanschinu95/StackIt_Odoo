import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AutoTagResult {
  tags: string[];
  confidence: number;
  reasoning: string;
}

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AIAnalysisResult {
  autoTags: AutoTagResult;
  moderation: ModerationResult;
  summary: SummaryResult;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async analyzeContent(title: string, content: string): Promise<AIAnalysisResult> {
    try {
      const prompt = `
Analyze this Q&A content and provide comprehensive insights:

TITLE: ${title}
CONTENT: ${content}

Please provide analysis in the following JSON format:
{
  "autoTags": {
    "tags": ["tag1", "tag2", "tag3"],
    "confidence": 0.95,
    "reasoning": "Explanation of why these tags were chosen"
  },
  "moderation": {
    "isAppropriate": true,
    "confidence": 0.98,
    "issues": [],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "summary": {
    "summary": "Brief summary of the content",
    "keyPoints": ["point1", "point2", "point3"],
    "category": "Technology/Programming/General",
    "difficulty": "intermediate"
  }
}

Guidelines:
- Tags: Choose 3-5 relevant, specific tags that would help others find this content
- Moderation: Check for inappropriate content, spam, or violations
- Summary: Provide a concise summary and categorize the content
- Difficulty: Assess if this is beginner, intermediate, or advanced level
- Be strict but fair in moderation
- Focus on technical accuracy and helpfulness
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(title, content);
    }
  }

  async autoTagContent(title: string, content: string): Promise<AutoTagResult> {
    try {
      const prompt = `
Analyze this content and suggest 3-5 relevant tags:

TITLE: ${title}
CONTENT: ${content}

Provide tags that are:
- Specific and relevant to the content
- Commonly used in Q&A platforms
- Helpful for categorization and search
- Technical when appropriate

Return as JSON:
{
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.95,
  "reasoning": "Why these tags were chosen"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Auto-tagging error:', error);
      return {
        tags: ['general'],
        confidence: 0.5,
        reasoning: 'Fallback tagging due to API error'
      };
    }
  }

  async moderateContent(title: string, content: string): Promise<ModerationResult> {
    try {
      const prompt = `
Moderate this content for appropriateness:

TITLE: ${title}
CONTENT: ${content}

Check for:
- Inappropriate or offensive content
- Spam or promotional content
- Personal attacks or harassment
- Copyright violations
- Misinformation or harmful advice

Return as JSON:
{
  "isAppropriate": true/false,
  "confidence": 0.95,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Be strict but fair. Flag content that violates community guidelines.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Moderation error:', error);
      return {
        isAppropriate: true,
        confidence: 0.5,
        issues: [],
        suggestions: ['Unable to analyze content due to API error']
      };
    }
  }

  async summarizeContent(title: string, content: string): Promise<SummaryResult> {
    try {
      const prompt = `
Summarize this Q&A content:

TITLE: ${title}
CONTENT: ${content}

Provide:
1. A concise summary (2-3 sentences)
2. Key points or takeaways
3. Content category (Technology, Programming, General, etc.)
4. Difficulty level (beginner, intermediate, advanced)

Return as JSON:
{
  "summary": "Brief summary",
  "keyPoints": ["point1", "point2", "point3"],
  "category": "Technology",
  "difficulty": "intermediate"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Summarization error:', error);
      return {
        summary: 'Content summary unavailable',
        keyPoints: ['Unable to extract key points'],
        category: 'General',
        difficulty: 'intermediate'
      };
    }
  }

  async generateAnswerSuggestions(question: string): Promise<string[]> {
    try {
      const prompt = `
Given this question, suggest 3-5 helpful answer approaches:

QUESTION: ${question}

Suggest different angles or approaches to answer this question effectively.
Focus on being helpful and comprehensive.

Return as a simple list:
1. First approach
2. Second approach
3. Third approach
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract numbered list
      const suggestions = text
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0);
      
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Answer suggestions error:', error);
      return ['Consider providing a detailed explanation', 'Include relevant examples', 'Reference official documentation'];
    }
  }

  async detectDuplicateQuestions(newQuestion: string, existingQuestions: string[]): Promise<{ isDuplicate: boolean; similarQuestions: string[]; confidence: number }> {
    try {
      const prompt = `
Check if this new question is a duplicate of existing questions:

NEW QUESTION: ${newQuestion}

EXISTING QUESTIONS:
${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Analyze if the new question is asking the same thing as any existing questions.
Consider:
- Core topic similarity
- Specific problem being solved
- Technical context

Return as JSON:
{
  "isDuplicate": true/false,
  "similarQuestions": ["question1", "question2"],
  "confidence": 0.85
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Duplicate detection error:', error);
      return {
        isDuplicate: false,
        similarQuestions: [],
        confidence: 0.5
      };
    }
  }

  private getFallbackAnalysis(title: string, content: string): AIAnalysisResult {
    return {
      autoTags: {
        tags: ['general'],
        confidence: 0.5,
        reasoning: 'Fallback analysis due to API error'
      },
      moderation: {
        isAppropriate: true,
        confidence: 0.5,
        issues: [],
        suggestions: ['Unable to analyze content']
      },
      summary: {
        summary: 'Content analysis unavailable',
        keyPoints: ['Unable to extract key points'],
        category: 'General',
        difficulty: 'intermediate'
      }
    };
  }
}

export const geminiService = new GeminiService(); 