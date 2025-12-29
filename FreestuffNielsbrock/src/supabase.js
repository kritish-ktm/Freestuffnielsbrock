import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://crcmzrtbuyahubqhutsz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY216cnRidXlhaHVicWh1dHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTYxNzcsImV4cCI6MjA1MTM5MjE3N30.eyjpc3NiIxNHViMWFzZSIsInNhSiIxOZSBHmYXVicj";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
