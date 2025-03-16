
import { useState, useEffect } from 'react';
import { useMemory } from '@/hooks/useMemory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { useAuth } from '@/hooks/useAuth';

export function MemoryDemo() {
  const { user } = useAuth();
  const memory = useMemory();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [memoryKeys, setMemoryKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [retrievedValue, setRetrievedValue] = useState<any>(null);
  
  // Load keys on component mount
  useEffect(() => {
    if (memory) {
      loadKeys();
    }
  }, [memory]);
  
  // Load keys from memory
  const loadKeys = async () => {
    if (!memory) return;
    
    try {
      const keys = await memory.listKeys();
      setMemoryKeys(keys);
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  };
  
  // Save a value to memory
  const handleSave = async () => {
    if (!memory || !key || !value) {
      toast.error('Please provide both key and value');
      return;
    }
    
    try {
      await memory.set(key, JSON.parse(value));
      toast.success('Value saved to memory');
      setKey('');
      setValue('');
      loadKeys();
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error('Failed to save to memory');
        console.error('Error saving to memory:', error);
      }
    }
  };
  
  // Load a value from memory
  const handleLoad = async (key: string) => {
    if (!memory) return;
    
    try {
      const value = await memory.get(key);
      setSelectedKey(key);
      setRetrievedValue(value);
    } catch (error) {
      toast.error('Failed to load from memory');
      console.error('Error loading from memory:', error);
    }
  };
  
  // Delete a value from memory
  const handleDelete = async (key: string) => {
    if (!memory) return;
    
    try {
      await memory.delete(key);
      toast.success('Value deleted from memory');
      if (selectedKey === key) {
        setSelectedKey(null);
        setRetrievedValue(null);
      }
      loadKeys();
    } catch (error) {
      toast.error('Failed to delete from memory');
      console.error('Error deleting from memory:', error);
    }
  };
  
  // Clear all memory
  const handleClearAll = async () => {
    if (!memory) return;
    
    try {
      await memory.clear();
      toast.success('Memory cleared');
      setMemoryKeys([]);
      setSelectedKey(null);
      setRetrievedValue(null);
    } catch (error) {
      toast.error('Failed to clear memory');
      console.error('Error clearing memory:', error);
    }
  };
  
  if (!user) {
    return (
      <Card className="w-full max-w-lg mx-auto my-8">
        <CardHeader>
          <CardTitle>Memory System</CardTitle>
          <CardDescription>Please log in to use the memory system</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <AnimatedContainer variant="fadeIn" className="w-full max-w-4xl mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Memory Storage</CardTitle>
            <CardDescription>Save data to your memory system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="key" className="text-sm font-medium">
                  Memory Key
                </label>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter a key for your data"
                />
              </div>
              <div>
                <label htmlFor="value" className="text-sm font-medium">
                  Value (JSON format)
                </label>
                <Textarea
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder='{"example": "value"}'
                  rows={5}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSave}>Save to Memory</Button>
            <Button variant="destructive" onClick={handleClearAll}>Clear All Memory</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stored Memories</CardTitle>
            <CardDescription>View and manage your stored data</CardDescription>
          </CardHeader>
          <CardContent>
            {memoryKeys.length === 0 ? (
              <p className="text-center text-gray-500">No memories stored yet</p>
            ) : (
              <ul className="space-y-2">
                {memoryKeys.map((key) => (
                  <li key={key} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                    <span className="font-medium truncate">{key}</span>
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => handleLoad(key)}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(key)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedKey && retrievedValue && (
              <div className="mt-6 p-4 border rounded">
                <h4 className="font-bold">{selectedKey}</h4>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-sm">
                  {JSON.stringify(retrievedValue, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
