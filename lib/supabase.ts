import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcqtuhlcyhixfndiysvh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcXR1aGxjeWhpeGZuZGl5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMDg1MjYsImV4cCI6MjA0Nzg4NDUyNn0.mPe0-TUorD_SpHnwmoMfJ5fiEHMiJuW_lJvP9cF1K-Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

