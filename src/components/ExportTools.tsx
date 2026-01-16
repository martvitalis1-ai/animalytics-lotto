import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ExportToolsProps {
  type: 'results' | 'predictions' | 'analysis';
  data?: any[];
  filename?: string;
}

export function ExportTools({ type, data, filename = 'animalytics' }: ExportToolsProps) {
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (data) return data;

    switch (type) {
      case 'results': {
        const { data: results } = await supabase
          .from('lottery_results')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        return results || [];
      }
      case 'predictions': {
        const { data: predictions } = await supabase
          .from('ai_predictions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        return predictions || [];
      }
      default:
        return [];
    }
  };

  const formatDataForExport = (rawData: any[]) => {
    if (type === 'results') {
      return rawData.map(r => {
        const lottery = LOTTERIES.find(l => l.id === r.lottery_type);
        return {
          Fecha: r.draw_date,
          Hora: r.draw_time,
          Lotería: lottery?.name || r.lottery_type,
          Número: r.result_number,
          Animal: r.animal_name || ANIMAL_MAPPING[r.result_number] || 'N/A',
          'Fecha Registro': new Date(r.created_at).toLocaleString()
        };
      });
    }

    if (type === 'predictions') {
      return rawData.map(p => {
        const lottery = LOTTERIES.find(l => l.id === p.lottery_type);
        return {
          Fecha: p.prediction_date,
          Lotería: lottery?.name || p.lottery_type,
          'Números Predichos': p.predicted_numbers?.join(', ') || '',
          'Animales Predichos': p.predicted_animals?.join(', ') || '',
          Confianza: `${p.confidence_score?.toFixed(1) || 0}%`,
          Notas: p.analysis_notes || ''
        };
      });
    }

    return rawData;
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const rawData = await fetchData();
      const formattedData = formatDataForExport(rawData);

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');

      // Ajustar anchos de columna
      const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Archivo Excel generado exitosamente');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al generar Excel');
    }
    setLoading(false);
  };

  const exportToPDF = async () => {
    setLoading(true);
    try {
      const rawData = await fetchData();
      const formattedData = formatDataForExport(rawData);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34);
      doc.text('ANIMALYTICS PRO', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Reporte de ${type === 'results' ? 'Resultados' : 'Predicciones'}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

      // Línea separadora
      doc.setDrawColor(34, 139, 34);
      doc.line(20, 40, pageWidth - 20, 40);

      // Contenido
      let yPos = 50;
      const lineHeight = 7;
      const margin = 20;

      doc.setFontSize(10);
      doc.setTextColor(0);

      // Headers
      const headers = Object.keys(formattedData[0] || {});
      const colWidth = (pageWidth - margin * 2) / headers.length;

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 5, pageWidth - margin * 2, lineHeight, 'F');
      
      headers.forEach((header, i) => {
        doc.setFont('helvetica', 'bold');
        doc.text(header.substring(0, 12), margin + i * colWidth + 2, yPos);
      });

      yPos += lineHeight;

      // Data rows (limit to fit page)
      const maxRows = Math.min(formattedData.length, 30);
      formattedData.slice(0, maxRows).forEach((row, rowIndex) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'normal');
        headers.forEach((header, i) => {
          const value = String(row[header] || '').substring(0, 12);
          doc.text(value, margin + i * colWidth + 2, yPos);
        });
        yPos += lineHeight;
      });

      // Footer
      if (formattedData.length > maxRows) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`... y ${formattedData.length - maxRows} registros más`, pageWidth / 2, yPos + 10, { align: 'center' });
      }

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Archivo PDF generado exitosamente');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error al generar PDF');
    }
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          Exportar a PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
