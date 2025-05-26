import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  process.exit(1);
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test connection and log result
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('sessions').select('id').limit(1);
    
    if (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    
    logger.info('Supabase connection successful');
    return true;
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error);
    return false;
  }
};