'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ThreeBackground from '@/components/ThreeBackground';
import { supabase } from '@/lib/supabase';

export default function CommunityHubPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('local'); // 'local' or 'global'
  
  // New Post State
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('recipe');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('nogirr_user') || 'null');
      if (userData) {
        setUser(userData);
      }
    } catch {}
  }, []);

  // Fetch when user loads or area filter changes
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, areaFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/community', window.location.origin);
      url.searchParams.append('filter', areaFilter);
      url.searchParams.append('lat', user.latitude || 0);
      url.searchParams.append('lng', user.longitude || 0);

      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setPosts(data);
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setPosting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          content,
          post_type: postType,
          latitude: user.latitude,
          longitude: user.longitude,
          city: user.city
        })
      });
      
      if (!res.ok) throw new Error('Failed to post');
      
      setContent('');
      fetchPosts(); // Refresh feed
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <AuthGuard>
      <ThreeBackground />
      <Navbar />
      
      <div className="page-container" style={{ position: 'relative', zIndex: 10, paddingTop: '100px', color: '#fff', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => router.push('/dashboard/health')} style={{ background: 'transparent', border: 'none', color: '#d0bcff', fontSize: '1.5rem', cursor: 'pointer' }}>
              ←
            </button>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
                Health <span style={{ color: '#d0bcff', textShadow: '0 0 15px rgba(208, 188, 255, 0.4)' }}>Hub</span>
              </h1>
              <p style={{ color: '#86948a', letterSpacing: '0.05em', marginTop: '5px' }}>RECIPES, DIETS & WELLNESS CHAT</p>
            </div>
          </div>
          
          {/* Area Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '5px', border: '1px solid rgba(208,188,255,0.3)' }}>
            <button 
              onClick={() => setAreaFilter('local')}
              style={{ padding: '8px 20px', borderRadius: '15px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', 
                background: areaFilter === 'local' ? '#d0bcff' : 'transparent',
                color: areaFilter === 'local' ? '#000' : '#86948a'
              }}>
              📍 50km Local
            </button>
            <button 
              onClick={() => setAreaFilter('global')}
              style={{ padding: '8px 20px', borderRadius: '15px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', 
                background: areaFilter === 'global' ? '#d0bcff' : 'transparent',
                color: areaFilter === 'global' ? '#000' : '#86948a'
              }}>
              🌍 Global
            </button>
          </div>
        </div>

        {/* Create Post Card */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '25px', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(208, 188, 255, 0.2)', borderRadius: '20px', marginBottom: '30px' }}>
          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a healthy recipe, a diet tip, or ask for wellness advice..."
              style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', fontSize: '1rem', outline: 'none', minHeight: '100px', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['recipe', 'diet_plan', 'chat'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    style={{ 
                      padding: '8px 15px', borderRadius: '20px', border: `1px solid ${postType === type ? '#d0bcff' : 'rgba(255,255,255,0.1)'}`, 
                      background: postType === type ? 'rgba(208,188,255,0.1)' : 'transparent', 
                      color: postType === type ? '#d0bcff' : '#86948a', cursor: 'pointer', textTransform: 'capitalize' 
                    }}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
              
              <button 
                type="submit" 
                disabled={posting || !content.trim()}
                style={{ padding: '10px 25px', background: '#d0bcff', color: '#000', border: 'none', borderRadius: '15px', fontWeight: 800, textTransform: 'uppercase', cursor: posting ? 'not-allowed' : 'pointer', boxShadow: '0 0 15px rgba(208, 188, 255, 0.3)' }}
              >
                {posting ? 'POSTING...' : 'PUBLISH'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#86948a' }}>Scanning satellites for posts...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed rgba(255,255,255,0.1)', color: '#86948a' }}>
              No posts found in this sector yet. Be the first to share!
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="glass-card animate-fade-in-up" style={{ padding: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(208,188,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(208,188,255,0.3)', color: '#d0bcff', fontWeight: 'bold' }}>
                       {post.users?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e5e7eb' }}>{post.users?.name || 'Unknown User'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#86948a' }}>📍 {post.city || 'Sector Unknown'} • {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.75rem', color: '#d0bcff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {post.post_type.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Content */}
                <p style={{ color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                  {post.content}
                </p>
                
              </div>
            ))
          )}
        </div>

      </div>
    </AuthGuard>
  );
}
