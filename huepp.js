// huepp.js - Diese Datei mit deiner HTML verlinken
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://smmspsnquuqischuhjyn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbXNwc25xdXVxaXNjaHVoanluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTQ1ODUsImV4cCI6MjA3NTMzMDU4NX0.xffqRWQYlg_25wkXMe0gU6QqkLBoFNqhjjmepPEF-xc'
const supabase = createClient(supabaseUrl, supabaseKey)

// Test-Funktion
async function testConnection() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
  
  if (error) {
    console.error('Fehler:', error)
  } else {
    console.log('Daten:', data)
  }
}