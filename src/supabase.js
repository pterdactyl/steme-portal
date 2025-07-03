import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exisucvezyqqbhjiizzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aXN1Y3ZlenlxcWJoamlpenpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjM5ODgsImV4cCI6MjA2NzEzOTk4OH0.6WThwBY5-LsDxiMWL-RkHTrK5pst8-U7lxaWp5kPk-0';

export const supabase = createClient(supabaseUrl, supabaseKey);