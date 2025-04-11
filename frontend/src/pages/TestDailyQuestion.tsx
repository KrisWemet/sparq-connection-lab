import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-provider';

export default function TestDailyQuestion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFunction = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-daily-question');
      
      if (error) {
        throw new Error(error.message || 'Error calling test function');
      }
      
      setResult(data);
      console.log('Test function result:', data);
    } catch (err: any) {
      console.error('Test function error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testRealFunction = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('daily-question');
      
      if (error) {
        throw new Error(error.message || 'Error calling daily-question function');
      }
      
      setResult(data);
      console.log('Daily question function result:', data);
    } catch (err: any) {
      console.error('Daily question function error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mr-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">Test Daily Question Function</h1>
      </header>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="p-4 bg-card rounded-lg shadow-sm border">
          <p>User ID: {user?.id || 'Not logged in'}</p>
          
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={testFunction} 
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Test Basic Function
            </Button>

            <Button 
              onClick={testRealFunction} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Test Daily Question
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
            <h3 className="font-semibold">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-card rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Result</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 