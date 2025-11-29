'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <button 
        onClick={() => router.push('/dash')}
        style={{ 
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '24px 48px',
          fontSize: '24px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '12px',
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
        [OVERRIDE] Go to Dashboard
      </button>
    </div>
  )
}
