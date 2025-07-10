import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export function ConnectionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [];

    // Test 1: Check if backend is reachable
    try {
      tests.push({ test: 'Backend Health Check', status: 'pending', message: 'Verificando conexión...' });
      setResults([...tests]);

      const response = await fetch('http://localhost:8000/api/v1/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        tests[tests.length - 1] = {
          test: 'Backend Health Check',
          status: 'success',
          message: '✅ Backend está funcionando correctamente',
          details: data
        };
      } else {
        tests[tests.length - 1] = {
          test: 'Backend Health Check',
          status: 'error',
          message: `❌ Error HTTP: ${response.status}`,
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        test: 'Backend Health Check',
        status: 'error',
        message: `❌ No se puede conectar al backend: ${(error as Error).message}`,
      };
    }

    // Test 2: Check costos-rigidos endpoint
    try {
      tests.push({ test: 'Costos Rígidos API', status: 'pending', message: 'Verificando endpoint...' });
      setResults([...tests]);

      const response = await fetch('http://localhost:8000/api/v1/costos-rigidos/costos-rigidos/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        tests[tests.length - 1] = {
          test: 'Costos Rígidos API',
          status: 'success',
          message: `✅ Endpoint funcionando. ${Array.isArray(data) ? data.length : 0} registros encontrados`,
          details: data
        };
      } else {
        tests[tests.length - 1] = {
          test: 'Costos Rígidos API',
          status: 'error',
          message: `❌ Error HTTP: ${response.status}`,
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        test: 'Costos Rígidos API',
        status: 'error',
        message: `❌ Error: ${(error as Error).message}`,
      };
    }

    // Test 3: Check colaboradores endpoint
    try {
      tests.push({ test: 'Colaboradores API', status: 'pending', message: 'Verificando endpoint...' });
      setResults([...tests]);

      const response = await fetch('http://localhost:8000/api/v1/colaboradores/colaboradores/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        tests[tests.length - 1] = {
          test: 'Colaboradores API',
          status: 'success',
          message: `✅ Endpoint funcionando. ${Array.isArray(data) ? data.length : 0} registros encontrados`,
          details: data
        };
      } else {
        tests[tests.length - 1] = {
          test: 'Colaboradores API',
          status: 'error',
          message: `❌ Error HTTP: ${response.status}`,
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        test: 'Colaboradores API',
        status: 'error',
        message: `❌ Error: ${(error as Error).message}`,
      };
    }

    setResults(tests);
    setIsRunning(false);
  };

  return (
    <Card className="glassmorphism border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🔧 Diagnóstico de Conexión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Diagnóstico'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-500/20 border-green-500/30 text-green-300'
                    : result.status === 'error'
                    ? 'bg-red-500/20 border-red-500/30 text-red-300'
                    : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                }`}
              >
                <div className="font-medium">{result.test}</div>
                <div className="text-sm">{result.message}</div>
                {result.details && (
                  <pre className="text-xs mt-2 opacity-75 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
