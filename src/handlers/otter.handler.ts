import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Transcript storage directory
const TRANSCRIPT_DIR = join(homedir(), '.mcp-google', 'otter-transcripts');
const PROCESSED_DIR = join(homedir(), '.mcp-google', 'processed');

// Ensure directories exist
function ensureDirectories() {
  if (!existsSync(TRANSCRIPT_DIR)) {
    mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  }
  if (!existsSync(PROCESSED_DIR)) {
    mkdirSync(PROCESSED_DIR, { recursive: true });
  }
}

interface Transcript {
  id: string;
  title: string;
  date: string;
  duration: number;
  transcript: string;
  summary: string;
  action_items?: string[];
  attendees?: string[];
  share_link?: string;
  filename?: string;
}

function loadTranscript(filename: string): Transcript | null {
  try {
    const filepath = join(TRANSCRIPT_DIR, filename);
    const content = readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    return { ...data, filename };
  } catch (error) {
    return null;
  }
}

function getAllTranscripts(): Transcript[] {
  ensureDirectories();
  
  try {
    const files = readdirSync(TRANSCRIPT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first
    
    const transcripts: Transcript[] = [];
    for (const file of files) {
      const transcript = loadTranscript(file);
      if (transcript) {
        transcripts.push(transcript);
      }
    }
    
    return transcripts;
  } catch (error) {
    return [];
  }
}

export async function handleOtterTool(name: string, args: any) {
  ensureDirectories();
  
  switch (name) {
    case 'otter_get_transcript': {
      const { search, date, lastN = 1 } = args;
      let transcripts = getAllTranscripts();
      
      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        transcripts = transcripts.filter(t => 
          t.title.toLowerCase().includes(searchLower) ||
          t.transcript.toLowerCase().includes(searchLower) ||
          (t.summary && t.summary.toLowerCase().includes(searchLower))
        );
      }
      
      // Filter by date
      if (date) {
        transcripts = transcripts.filter(t => 
          t.date && t.date.startsWith(date)
        );
      }
      
      // Return last N
      const results = transcripts.slice(0, lastN);
      
      return {
        found: results.length > 0,
        count: results.length,
        transcripts: results.map(t => ({
          id: t.id,
          title: t.title,
          date: t.date,
          duration: t.duration,
          transcript: t.transcript,
          summary: t.summary,
          actionItems: t.action_items || [],
          attendees: t.attendees || []
        }))
      };
    }
    
    case 'otter_list_transcripts': {
      const { limit = 10 } = args;
      const transcripts = getAllTranscripts().slice(0, limit);
      
      return {
        count: transcripts.length,
        transcripts: transcripts.map(t => ({
          id: t.id,
          title: t.title,
          date: t.date,
          duration: t.duration,
          hasSummary: !!t.summary,
          hasActionItems: !!(t.action_items && t.action_items.length > 0),
          wordCount: t.transcript ? t.transcript.split(' ').length : 0
        }))
      };
    }
    
    case 'otter_search_insights': {
      const { query, dateRange } = args;
      let transcripts = getAllTranscripts();
      
      // Filter by date range
      if (dateRange) {
        transcripts = transcripts.filter(t => {
          if (!t.date) return false;
          const tDate = new Date(t.date);
          if (dateRange.start && tDate < new Date(dateRange.start)) return false;
          if (dateRange.end && tDate > new Date(dateRange.end)) return false;
          return true;
        });
      }
      
      // Search for query in transcripts
      const queryLower = query.toLowerCase();
      const results = [];
      
      for (const transcript of transcripts) {
        const text = transcript.transcript.toLowerCase();
        const lines = transcript.transcript.split('\n');
        const relevantLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            // Get context (line before and after)
            const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2));
            relevantLines.push(context.join('\n'));
          }
        }
        
        if (relevantLines.length > 0) {
          results.push({
            title: transcript.title,
            date: transcript.date,
            excerpts: relevantLines.slice(0, 3), // Max 3 excerpts per meeting
            matchCount: relevantLines.length
          });
        }
      }
      
      return {
        query,
        meetingsFound: results.length,
        results: results.slice(0, 10), // Max 10 meetings
        totalMatches: results.reduce((sum, r) => sum + r.matchCount, 0)
      };
    }
    
    default:
      throw new Error(`Unknown Otter tool: ${name}`);
  }
}
