'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ThreeBackground from '@/components/ThreeBackground';
import { supabase } from '@/lib/supabase';

export default function AIDietPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Input State
  const [healthInfo, setHealthInfo] = useState('');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Result State
  const [dietPlan, setDietPlan] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('nogirr_user') || 'null');
      if (userData) {
        setUser(userData);
      }
    } catch {}
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!healthInfo) return;
    
    setLoading(true);
    setError('');
    setDietPlan(null);
    
    try {
      const res = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ healthInfo, dietaryPreference: dietaryPref })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate diet plan.');

      setDietPlan(data);

      // Optionally save to health_profiles in Supabase
      if (user) {
        await supabase
          .from('health_profiles')
          .upsert({
            user_id: user.id,
            medical_issues: healthInfo,
            dietary_preference: dietaryPref,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }

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
          <button onClick={() => router.push('/dashboard/health')} style={{ background: 'transparent', border: 'none', color: '#ffb95f', fontSize: '1.5rem', cursor: 'pointer' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
              AI Diet <span style={{ color: '#ffb95f', textShadow: '0 0 15px rgba(255, 185, 95, 0.4)' }}>Architect</span>
            </h1>
            <p style={{ color: '#86948a', letterSpacing: '0.05em', marginTop: '5px' }}>CLINICAL SURVIVAL & WELLNESS MAP</p>
          </div>
        </div>

        {/* The Generator Card */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '30px', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 185, 95, 0.2)', borderRadius: '20px', marginBottom: '40px' }}>
          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px' }}>⚠️ {error}</div>}
            
            <div>
              <label style={{ display: 'block', color: '#ffb95f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Medical History & Goals</label>
              <textarea 
                value={healthInfo}
                onChange={(e) => setHealthInfo(e.target.value)}
                placeholder="e.g. I have mild iron deficiency and I am diabetic. I need to stabilize my blood sugar while recovering iron levels..."
                style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none', minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <label style={{ color: '#bbcabf', fontSize: '0.9rem' }}>Dietary Preference:</label>
              <select 
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                style={{ padding: '10px 15px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,185,95,0.3)', color: '#ffb95f', borderRadius: '8px', outline: 'none' }}
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>

              <button 
                type="submit" 
                disabled={loading || !healthInfo}
                style={{ marginLeft: 'auto', padding: '12px 25px', background: '#ffb95f', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 15px rgba(255,185,95,0.3)' }}
              >
                {loading ? 'ANALYZING REPORT...' : 'GENERATE PLAN'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Block */}
        {dietPlan && (
          <div className="glass-card animate-fade-in-up" style={{ padding: '30px', background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(255,185,95,0.2)', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffb95f', marginBottom: '20px', textTransform: 'uppercase' }}>Clinical Protocol</h2>
            
            <div style={{ padding: '20px', background: 'rgba(255,185,95,0.05)', borderRadius: '10px', marginBottom: '25px', borderLeft: '4px solid #ffb95f' }}>
              <p style={{ fontSize: '1rem', color: '#d1d5db', lineHeight: 1.6 }}>{dietPlan.ai_advice}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              
              {/* Survival Nutrients */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                <h3 style={{ color: '#00e5ff', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>🧩 Vital Nutrients Needed</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dietPlan.survival_nutrients?.map((n, i) => (
                    <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#e5e7eb' }}>
                      <span style={{ color: '#00e5ff' }}>▹</span> {n}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Foods To Eat */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <h3 style={{ color: '#10b981', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>🟢 Recommended Foods</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dietPlan.foods_to_eat?.map((f, i) => (
                    <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#e5e7eb' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Foods To Avoid */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <h3 style={{ color: '#ef4444', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>🔴 Foods to Avoid</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dietPlan.foods_to_avoid?.map((f, i) => (
                    <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#e5e7eb' }}>
                      <span style={{ color: '#ef4444' }}>×</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>
    </AuthGuard>
  );
}
