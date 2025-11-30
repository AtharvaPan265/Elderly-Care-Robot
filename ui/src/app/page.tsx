'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function Page() {
  const router = useRouter()
  const [status, setStatus] = useState({
    emotion: null,
    approachable: false,
    score: 0,
    feedback: []
  })
  const [isRunning, setIsRunning] = useState(false)

  // Start detection when component mounts
  useEffect(() => {
    const startDetection = async () => {
      try {
        const response = await fetch(`${API_BASE}/start`, { method: 'POST' })
        const data = await response.json()
        console.log('Start response:', data)
        setIsRunning(data.status === 'started' || data.status === 'already_running')
      } catch (error) {
        console.error('Failed to start detection:', error)
      }
    }

    startDetection()

    // Cleanup: stop detection when component unmounts
    return () => {
      fetch(`${API_BASE}/stop`, { method: 'POST' })
        .catch(err => console.error('Stop error:', err))
    }
  }, [])

  // Poll for state updates
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/state`)
        const data = await response.json()

        if (data.status === 'running') {
          setStatus(data)
          console.log('State:', data)

          // Auto-redirect when approachable
          if (data.approachable) {
            console.log('✅ User is approachable! Redirecting...')
            await fetch(`${API_BASE}/stop`, { method: 'POST' })
            router.push('/dash')
          }
        }
      } catch (error) {
        console.error('Failed to get state:', error)
      }
    }, 100) // Poll every 100ms

    return () => clearInterval(interval)
  }, [isRunning, router])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px'
    }}>
      {/* Status Card */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '40px',
        borderRadius: '16px',
        marginBottom: '20px',
        minWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '28px' }}>
          Waiting for Interaction...
        </h1>

        {/* Connection Status */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isRunning ? '#10b981' : '#ef4444',
            marginRight: '8px'
          }}></span>
          {isRunning ? 'Camera Running' : 'Starting...'}
        </div>

        {/* Live Data */}
        {isRunning && (
          <>
            <p style={{ marginBottom: '10px' }}>
              <strong>Emotion:</strong> {status.emotion || 'Detecting...'}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Score:</strong> {status.score?.toFixed(2) || '0.00'}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Status:</strong>{' '}
              <span style={{
                color: status.approachable ? '#10b981' : '#ef4444'
              }}>
                {status.approachable ? '✓ Approachable' : '✗ Not Approachable'}
              </span>
            </p>

            {/* Feedback */}
            {status.feedback && status.feedback.length > 0 && (
              <div style={{
                marginTop: '20px',
                fontSize: '14px',
                color: '#a0a0a0'
              }}>
                <strong>Feedback:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {status.feedback.slice(0, 3).map((fb, i) => (
                    <li key={i}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual Override Button */}
      <button
        onClick={() => {
          // Stop detection (don't wait for response)
          fetch(`${API_BASE}/stop`, { method: 'POST' })
            .catch(err => console.error('Stop error:', err))

          // Navigate immediately
          router.push('/dash')
        }}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#b91c1c'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        [OVERRIDE] Skip to Dashboard
      </button>

    </div>
  )
}
