import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';

const SummaryPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-slideInUp">
      <Card>
        <CardHeader>
          <CardTitle>Resúmenes de Recuerdos</CardTitle>
          <CardDescription>
            Revive nUestras aventuras con resúmenes mensuales y anuales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground">Próximamente...</h3>
            <p className="text-muted-foreground mt-2">
              Esta sección generará automáticamente un resumen de nuestros recuerdos, ¡como un "Wrapped" de nuestra relación!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryPage;
