// ============================================================
// BOT MEMORY SYSTEM - Persistent memory for Ricardo chatbot
// Stores admin-defined instructions and learning context
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export interface BotMemoryEntry {
  id: string;
  user_id: string | null;
  role: string;
  content: string;
  memory_type: 'instruction' | 'learning' | 'preference';
  is_active: boolean;
  created_at: string;
}

// Save a new memory entry
export const saveBotMemory = async (
  content: string,
  memoryType: 'instruction' | 'learning' | 'preference' = 'instruction',
  userId?: string
): Promise<boolean> => {
  const { error } = await supabase.from('bot_memory').insert({
    content,
    memory_type: memoryType,
    user_id: userId || null,
    role: 'system',
    is_active: true,
  });

  return !error;
};

// Get all active memories
export const getActiveMemories = async (): Promise<BotMemoryEntry[]> => {
  const { data, error } = await supabase
    .from('bot_memory')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(d => ({
    id: d.id,
    user_id: d.user_id,
    role: d.role,
    content: d.content,
    memory_type: d.memory_type as 'instruction' | 'learning' | 'preference',
    is_active: d.is_active,
    created_at: d.created_at,
  }));
};

// Get memories by type
export const getMemoriesByType = async (
  memoryType: 'instruction' | 'learning' | 'preference'
): Promise<BotMemoryEntry[]> => {
  const { data, error } = await supabase
    .from('bot_memory')
    .select('*')
    .eq('is_active', true)
    .eq('memory_type', memoryType)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(d => ({
    id: d.id,
    user_id: d.user_id,
    role: d.role,
    content: d.content,
    memory_type: d.memory_type as 'instruction' | 'learning' | 'preference',
    is_active: d.is_active,
    created_at: d.created_at,
  }));
};

// Deactivate a memory (soft delete)
export const deactivateMemory = async (memoryId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bot_memory')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', memoryId);

  return !error;
};

// Build context from memories for chatbot
export const buildMemoryContext = async (): Promise<string> => {
  const memories = await getActiveMemories();

  if (memories.length === 0) {
    return '';
  }

  const instructions = memories
    .filter(m => m.memory_type === 'instruction')
    .map(m => m.content);

  const learning = memories
    .filter(m => m.memory_type === 'learning')
    .slice(0, 5)
    .map(m => m.content);

  let context = '';

  if (instructions.length > 0) {
    context += `[INSTRUCCIONES DEL ADMINISTRADOR]\n${instructions.join('\n')}\n\n`;
  }

  if (learning.length > 0) {
    context += `[APRENDIZAJE RECIENTE]\n${learning.join('\n')}\n`;
  }

  return context;
};

// Check if message contains save memory command
export const extractSaveMemoryCommand = (
  message: string
): { shouldSave: boolean; content: string } => {
  const patterns = [
    /guardar?\s+en\s+memoria[:\s]+(.+)/i,
    /recuerda[:\s]+(.+)/i,
    /memoriza[:\s]+(.+)/i,
    /guarda\s+esto[:\s]+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return { shouldSave: true, content: match[1].trim() };
    }
  }

  return { shouldSave: false, content: '' };
};
