import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Button from '../components/Button';
import { getMemories } from '../services/memoryService';
import type { Memory } from '../types';
import { LoadingSpinner, UploadCloud } from '../components/Icons';

const SettingsPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const memories = await getMemories();
      const dataStr = JSON.stringify(memories, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nuestro-diario-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      alert('Hubo un error al exportar los recuerdos.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const memories: Memory[] = JSON.parse(content);

        // Basic validation
        if (!Array.isArray(memories)) {
            throw new Error("El archivo no es un array de recuerdos válido.");
        }

        setIsImporting(true);
        setImportStatus('idle');
        setImportMessage('');

        const response = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memories }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error en el servidor al importar.');
        }
        
        setImportStatus('success');
        setImportMessage(`¡Éxito! Se importaron ${result.importedCount} recuerdos.`);

      } catch (error: any) {
        setImportStatus('error');
        setImportMessage(`Error al importar: ${error.message}`);
        console.error(error);
      } finally {
        setIsImporting(false);
        // Reset file input
        if(importFileRef.current) {
            importFileRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="max-w-2xl mx-auto animate-slideInUp space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes y Seguridad</CardTitle>
          <CardDescription>
            Gestiona la información de tu diario. Es una buena idea hacer copias de seguridad regularmente.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Copia de Seguridad</CardTitle>
            <CardDescription>
                Descarga un archivo con todos tus recuerdos, incluyendo textos, ubicaciones y enlaces a tus fotos y videos. Guarda este archivo en un lugar seguro.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
                {isExporting && <LoadingSpinner className="w-4 h-4 mr-2" />}
                {isExporting ? 'Exportando...' : 'Exportar todos los recuerdos'}
            </Button>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
            <CardTitle>Restaurar desde Copia de Seguridad</CardTitle>
            <CardDescription>
                <span className="font-semibold text-destructive">Atención:</span> Esta acción añadirá los recuerdos del archivo a tu diario actual. No elimina los recuerdos existentes.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <input 
                type="file" 
                accept=".json"
                ref={importFileRef}
                onChange={handleImportFileChange}
                className="hidden" 
            />
            <Button 
                variant="outline" 
                onClick={() => importFileRef.current?.click()}
                disabled={isImporting}
                className="w-full sm:w-auto"
            >
                {isImporting ? <LoadingSpinner className="w-4 h-4 mr-2"/> : <UploadCloud className="w-4 h-4 mr-2" />}
                {isImporting ? 'Importando...' : 'Seleccionar archivo de respaldo'}
            </Button>
            {importMessage && (
                <p className={`mt-4 text-sm ${importStatus === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                    {importMessage}
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
