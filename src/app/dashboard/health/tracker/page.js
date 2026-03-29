'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ThreeBackground from '@/components/ThreeBackground';
import { supabase } from '@/lib/supabase';

export default function CalorieTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Input State
  const [mealText, setMealText] = useState('');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // History State
  const [mealLogs, setMealLogs] = useState([]);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('nogirr_user') || 'null');
      if (userData) {
        setUser(userData);
        fetchMealHistory(userData.id);
      }
    } catch {}
  }, []);

  const fetchMealHistory = async (userId) => {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
      
    if (!error && data) {
      setMealLogs(data);
    }
  };

  const handleAnalyzeMeal = async (e) => {
    e.preventDefault();
    if (!mealText) return;
    
    setLoading(true);
    setError('');
    
    try {
      // 1. Ask Gemini to analyze the meal
      const res = await fetch('/api/ai/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealText, dietaryPreference: dietaryPref })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to analyze meal.');

      // 2. Save the result to Supabase
      const { error: insertError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_description: data.estimated_meal_name || mealText,
          calories: Math.round(data.calories || 0),
          protein: Math.round(data.protein || 0),
          carbs: Math.round(data.carbs || 0),
          fats: Math.round(data.fats || 0),
          fiber: Math.round(data.fiber || 0),
          confidence_score: Math.round(data.confidence_score || 0),
          carbon_impact_kg: data.carbon_impact_kg || 0, // This is a decimal column
          missing_nutrients_suggested: data.missing_nutrients_suggested || 'No data generated.'
        });

      if (insertError) {
        console.error('Supabase Error:', insertError);
        // Note: New columns might not exist yet if SQL hasn't been run.
        // For the competition, we'll gracefully fallback or show a helpful error.
        throw new Error('Database Error: ' + insertError.message);
      }

      // 3. Refresh History & Clear
      setMealText('');
      fetchMealHistory(user.id);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <ThreeBackground />
      <Navbar />
      
      <div className="page-container" style={{ position: 'relative', zIndex: 10, paddingTop: '100px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => router.push('/dashboard/health')} style={{ background: 'transparent', border: 'none', color: '#00e5ff', fontSize: '1.5rem', cursor: 'pointer' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
              AI Calorie <span style={{ color: '#00e5ff', textShadow: '0 0 15px rgba(0, 229, 255, 0.4)' }}>Tracker</span>
            </h1>
            <p style={{ color: '#86948a', letterSpacing: '0.05em', marginTop: '5px' }}>MAP MACROS & ATTAIN BASIC HUMAN NEEDS</p>
          </div>
        </div>

        {/* The Analyzer Card */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '30px', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '20px', marginBottom: '40px' }}>
          <form onSubmit={handleAnalyzeMeal} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px' }}>⚠️ {error}</div>}
            
            <div>
              <label style={{ display: 'block', color: '#00e5ff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>What did you eat?</label>
              <textarea 
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="e.g. 2 slices of whole wheat bread with 2 scrambled eggs, and a glass of milk..."
                style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <label style={{ color: '#bbcabf', fontSize: '0.9rem' }}>Dietary Preference:</label>
              <select 
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                style={{ padding: '10px 15px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff', borderRadius: '8px', outline: 'none' }}
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>

              <button 
                type="submit" 
                disabled={loading || !mealText}
                style={{ marginLeft: 'auto', padding: '12px 25px', background: '#00e5ff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 15px rgba(0,229,255,0.3)' }}
              >
                {loading ? 'ANALYZING...' : 'ANALYZE MEAL'}
              </button>
            </div>
          </form>
        </div>

        {/* History Track */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '20px', letterSpacing: '1px' }}>YOUR STRUCTURAL TRACK</h2>
        
        {mealLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed rgba(255,255,255,0.1)', color: '#86948a' }}>
            No meals logged yet. The AI is awaiting your input.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mealLogs.map((log) => (
              <div key={log.id} className="glass-card animate-fade-in-up" style={{ padding: '25px', background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>{log.meal_description}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#86948a' }}>{new Date(log.logged_at).toLocaleDateString()} {new Date(log.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                {/* Macros Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ color: '#00e5ff', fontSize: '1.2rem', fontWeight: 800 }}>{log.calories}</div><div style={{ fontSize: '0.75rem', color: '#bbcabf', textTransform: 'uppercase' }}>KCAL</div></div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#ffb95f', fontSize: '1.2rem', fontWeight: 800 }}>{log.protein}g</div><div style={{ fontSize: '0.75rem', color: '#bbcabf', textTransform: 'uppercase' }}>PROTEIN</div></div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#d0bcff', fontSize: '1.2rem', fontWeight: 800 }}>{log.carbs}g</div><div style={{ fontSize: '0.75rem', color: '#bbcabf', textTransform: 'uppercase' }}>CARBS</div></div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#fca5a5', fontSize: '1.2rem', fontWeight: 800 }}>{log.fats}g</div><div style={{ fontSize: '0.75rem', color: '#bbcabf', textTransform: 'uppercase' }}>FATS</div></div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 800 }}>{log.fiber}g</div><div style={{ fontSize: '0.75rem', color: '#bbcabf', textTransform: 'uppercase' }}>FIBER</div></div>
                </div>

                {/* AI Suggestions Box (The "Gap" compared to baseline) */}
                <div style={{ background: 'rgba(0, 229, 255, 0.05)', borderLeft: '4px solid #00e5ff', padding: '15px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px' }}>🤖 AI Nutrient Analysis & Suggestions:</h4>
                    
                    {/* Innovation: Impact & Confidence Badges */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {log.confidence_score > 0 && (
                        <span title="AI estimate confidence" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#bbcabf' }}>
                          ACCURACY: {log.confidence_score}%
                        </span>
                      )}
                      {log.carbon_impact_kg > 0 && (
                        <span title="Carbon saved by preventing waste" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', color: '#10b981' }}>
                          IMPACT: -{log.carbon_impact_kg}kg CO2
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#d1d5db', lineHeight: 1.5 }}>
                    {log.missing_nutrients_suggested}
                  </p>
                </div>
              </div>
            ))}

            {/* Stability: Loading Skeletons */}
            {loading && (
              <div className="glass-card" style={{ padding: '25px', background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', opacity: 0.6 }}>
                <div style={{ width: '60%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '15px' }} className="skeleton-pulse" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} className="skeleton-pulse" />
                  ))}
                </div>
                <div style={{ height: '60px', background: 'rgba(0, 229, 255, 0.02)', borderRadius: '8px' }} className="skeleton-pulse" />
              </div>
            )}
          </div>
        )}

        {/* CSS for Skeletons */}
        <style jsx>{`
          .skeleton-pulse {
            animation: pulse 1.5s infinite ease-in-out;
            background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08), rgba(255,255,255,0.03));
            background-size: 200% 100%;
          }
          @keyframes pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
