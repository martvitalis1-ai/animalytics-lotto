import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/30 bg-card shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive uppercase font-black tracking-tight">
              <AlertTriangle className="w-5 h-5" />
              {this.props.title || 'Sección no disponible'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Esta sección falló al cargar, pero la app sigue activa.
            </p>
            <Button type="button" variant="outline" onClick={this.handleRetry} className="font-black uppercase">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
