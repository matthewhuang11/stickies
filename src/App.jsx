import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Wall from './components/Wall'
import LoginPage from './components/LoginPage'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf6f0' }} />
  )

  return user ? <Wall user={user} /> : <LoginPage />
}
