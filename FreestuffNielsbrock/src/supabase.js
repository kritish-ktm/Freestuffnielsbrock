import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://crcmzrtbuyahubqhutsz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY216cnRidXlhaHVicWh1dHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTU1MDcsImV4cCI6MjA4MTI5MTUwN30.x3BMvXQdbBCDnIXlGDvmIEAZUwZ1yHncxW7bHA0mHMU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
