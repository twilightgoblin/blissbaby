'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function MigrationButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const runMigrations = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer migrate-now'
        }
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Database Migrations</h3>
      <Button 
        onClick={runMigrations} 
        disabled={loading}
        variant="outline"
      >
        {loading ? 'Running...' : 'Run Migrations'}
      </Button>
      
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-sm overflow-auto">
          {result}
        </pre>
      )}
    </div>
  )
}