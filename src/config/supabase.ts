import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  process.exit(1);
}

// Create Supabase client (for regular operations)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Create admin client (for admin operations)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (!supabaseAdmin) {
  logger.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin operations will not be available.');
}

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

// Test admin client
export const testAdminConnection = async () => {
  try {
    if (!supabaseAdmin) {
      logger.error('Admin client not available');
      return false;
    }

    // Test admin client by trying to list users (this requires service_role)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    if (error) {
      logger.error('Admin client test failed:', error);
      return false;
    }

    logger.info('Admin client connection successful');
    return true;
  } catch (error) {
    logger.error('Failed to test admin client:', error);
    return false;
  }
};