<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPayment;
use App\Models\OtherPayment;
use App\Models\InstallmentPlanPayment;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

class ReportController extends Controller
{
    /**
     * Muestra la vista principal de reportes
     */
    public function index(Request $request): Response
    {
        $reportType = $request->input('report_type', 'day');
        $date = $request->input('date', now()->format('Y-m-d'));
        $community = $request->input('community', '');

        $reportData = $this->generateReport($reportType, $date, $community);

        return Inertia::render('Reports/Index', [
            'reportData' => $reportData,
            'filters' => [
                'report_type' => $reportType,
                'date' => $date,
                'community' => $community,
            ],
            'communities' => Owner::COMMUNITIES,
        ]);
    }

    /**
     * Genera los datos del reporte según el tipo
     */
    private function generateReport(string $reportType, string $date, ?string $community): array
    {
        $carbonDate = Carbon::parse($date);
        
        switch ($reportType) {
            case 'day':
                return $this->getDailyReport($carbonDate, $community);
            case 'week':
                return $this->getWeeklyReport($carbonDate, $community);
            case 'month':
                return $this->getMonthlyReport($carbonDate, $community);
            case 'year':
                return $this->getYearlyReport($carbonDate, $community);
            default:
                return $this->getDailyReport($carbonDate, $community);
        }
    }

    /**
     * Reporte diario
     */
    private function getDailyReport(Carbon $date, ?string $community): array
    {
        $startDate = $date->copy()->startOfDay();
        $endDate = $date->copy()->endOfDay();

        return $this->getReportData($startDate, $endDate, $community, 'Reporte del día ' . $date->format('d/m/Y'));
    }

    /**
     * Reporte semanal
     */
    private function getWeeklyReport(Carbon $date, ?string $community): array
    {
        $startDate = $date->copy()->startOfWeek();
        $endDate = $date->copy()->endOfWeek();

        return $this->getReportData(
            $startDate, 
            $endDate, 
            $community, 
            'Reporte semanal del ' . $startDate->format('d/m/Y') . ' al ' . $endDate->format('d/m/Y')
        );
    }

    /**
     * Reporte mensual
     */
    private function getMonthlyReport(Carbon $date, ?string $community): array
    {
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        return $this->getReportData(
            $startDate, 
            $endDate, 
            $community, 
            'Reporte mensual de ' . ucfirst($date->translatedFormat('F Y'))
        );
    }

    /**
     * Reporte anual
     */
    private function getYearlyReport(Carbon $date, ?string $community): array
    {
        $startDate = $date->copy()->startOfYear();
        $endDate = $date->copy()->endOfYear();

        return $this->getReportData(
            $startDate, 
            $endDate, 
            $community, 
            'Reporte anual ' . $date->format('Y')
        );
    }

    /**
     * Obtiene los datos del reporte para el rango de fechas especificado
     */
    private function getReportData(Carbon $startDate, Carbon $endDate, ?string $community, string $title): array
    {
        // Pagos mensuales
        $monthlyQuery = MonthlyPayment::with(['waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        
        if ($community) {
            $monthlyQuery->whereHas('waterConnection', function ($q) use ($community) {
                $q->where('community', $community);
            });
        }
        
        $monthlyPayments = $monthlyQuery->get();
        $monthlyTotal = $monthlyPayments->sum('total_amount');
        $monthlyCount = $monthlyPayments->count();

        // Otros pagos
        $otherQuery = OtherPayment::with(['waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        
        if ($community) {
            $otherQuery->whereHas('waterConnection', function ($q) use ($community) {
                $q->where('community', $community);
            });
        }
        
        $otherPayments = $otherQuery->get();
        $otherTotal = $otherPayments->sum('amount');
        $otherCount = $otherPayments->count();

        // Pagos de cuotas
        $installmentQuery = InstallmentPlanPayment::with(['installmentPlan.waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        
        if ($community) {
            $installmentQuery->whereHas('installmentPlan.waterConnection', function ($q) use ($community) {
                $q->where('community', $community);
            });
        }
        
        $installmentPayments = $installmentQuery->get();
        $installmentTotal = $installmentPayments->sum('amount_paid');
        $installmentCount = $installmentPayments->count();

        // Desglose de otros pagos por tipo
        $otherPaymentsByType = $otherPayments->groupBy('payment_type')->map(function ($payments, $type) {
            return [
                'type' => $type,
                'type_label' => OtherPayment::PAYMENT_TYPES[$type] ?? $type,
                'count' => $payments->count(),
                'total' => $payments->sum('amount'),
            ];
        })->values();

        // Total general
        $grandTotal = $monthlyTotal + $otherTotal + $installmentTotal;
        $totalPayments = $monthlyCount + $otherCount + $installmentCount;

        return [
            'title' => $title,
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
                'start_formatted' => $startDate->format('d/m/Y'),
                'end_formatted' => $endDate->format('d/m/Y'),
            ],
            'summary' => [
                'monthly' => [
                    'count' => $monthlyCount,
                    'total' => $monthlyTotal,
                ],
                'other' => [
                    'count' => $otherCount,
                    'total' => $otherTotal,
                ],
                'installment' => [
                    'count' => $installmentCount,
                    'total' => $installmentTotal,
                ],
                'grand_total' => $grandTotal,
                'total_payments' => $totalPayments,
            ],
            'other_payments_by_type' => $otherPaymentsByType,
        ];
    }

    /**
     * Exporta el reporte a Excel (XLSX)
     */
    public function exportExcel(Request $request)
    {
        $reportType = $request->input('report_type', 'day');
        $date = $request->input('date', now()->format('Y-m-d'));
        $community = $request->input('community', '');

        $reportData = $this->generateReport($reportType, $date, $community);
        
        // Obtener pagos detallados
        $carbonDate = Carbon::parse($date);
        $detailedData = $this->getDetailedPayments($reportType, $carbonDate, $community);

        // Crear spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $row = 1;
        
        // Título (A1:I1 combinadas)
        $sheet->setCellValue('A' . $row, $reportData['title']);
        $sheet->mergeCells('A' . $row . ':I' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row++;
        
        // Período (A2:I2 combinadas)
        $sheet->setCellValue('A' . $row, 'Período: ' . $reportData['period']['start_formatted'] . ' - ' . $reportData['period']['end_formatted']);
        $sheet->mergeCells('A' . $row . ':I' . $row);
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row++;
        
        // Fecha generación (A3:I3 combinadas)
        $sheet->setCellValue('A' . $row, 'Generado el: ' . now()->format('d/m/Y H:i:s'));
        $sheet->mergeCells('A' . $row . ':I' . $row);
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row++;
        
        $row++; // Línea vacía
        
        // Resumen
        $sheet->setCellValue('A' . $row, 'PAGOS MENSUALES');
        $sheet->setCellValue('B' . $row, 'OTROS PAGOS');
        $sheet->setCellValue('C' . $row, 'PAGOS DE CUOTAS');
        $sheet->setCellValue('D' . $row, 'TOTAL GENERAL');
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true)->setSize(9);
        $sheet->getStyle('A' . $row . ':D' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
        $row++;
        
        $sheet->setCellValue('A' . $row, '$' . number_format($reportData['summary']['monthly']['total'], 2));
        $sheet->setCellValue('B' . $row, '$' . number_format($reportData['summary']['other']['total'], 2));
        $sheet->setCellValue('C' . $row, '$' . number_format($reportData['summary']['installment']['total'], 2));
        $sheet->setCellValue('D' . $row, '$' . number_format($reportData['summary']['grand_total'], 2));
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true)->setSize(12);
        $row++;
        
        $sheet->setCellValue('A' . $row, $reportData['summary']['monthly']['count'] . ' pago(s)');
        $sheet->setCellValue('B' . $row, $reportData['summary']['other']['count'] . ' pago(s)');
        $sheet->setCellValue('C' . $row, $reportData['summary']['installment']['count'] . ' pago(s)');
        $sheet->setCellValue('D' . $row, $reportData['summary']['total_payments'] . ' pago(s)');
        $row++;
        
        $row++; // Línea vacía
        
        // Desglose de otros pagos
        if (count($reportData['other_payments_by_type']) > 0) {
            $sheet->setCellValue('A' . $row, 'Desglose de Otros Pagos');
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $sheet->setCellValue('A' . $row, 'Tipo de Pago');
            $sheet->setCellValue('B' . $row, 'Cantidad');
            $sheet->setCellValue('C' . $row, 'Total');
            $sheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true)->setSize(9);
            $sheet->getStyle('A' . $row . ':C' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $row++;
            
            foreach ($reportData['other_payments_by_type'] as $type) {
                $sheet->setCellValue('A' . $row, $type['type_label']);
                $sheet->setCellValue('B' . $row, $type['count']);
                $sheet->setCellValue('C' . $row, '$' . number_format($type['total'], 2));
                $sheet->getStyle('A' . $row . ':C' . $row)->getFont()->setSize(9);
                $row++;
            }
            
            $row++; // Línea vacía
        }
        
        // Detalle de pagos
        if (count($detailedData) > 0) {
            $sheet->setCellValue('A' . $row, 'Detalle de Pagos');
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $sheet->setCellValue('A' . $row, 'N° Ticket');
            $sheet->setCellValue('B' . $row, 'Fecha/Hora');
            $sheet->setCellValue('C' . $row, 'Propietario');
            $sheet->setCellValue('D' . $row, 'DUI');
            $sheet->setCellValue('E' . $row, 'Correo');
            $sheet->setCellValue('F' . $row, 'No. Paja');
            $sheet->setCellValue('G' . $row, 'Comunidad');
            $sheet->setCellValue('H' . $row, 'Tipo/Descripción');
            $sheet->setCellValue('I' . $row, 'Valor');
            $sheet->getStyle('A' . $row . ':I' . $row)->getFont()->setBold(true)->setSize(9);
            $sheet->getStyle('A' . $row . ':I' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $row++;
            
            foreach ($detailedData as $payment) {
                $sheet->setCellValue('A' . $row, $payment['receipt_number']);
                $sheet->setCellValue('B' . $row, $payment['payment_datetime']);
                $sheet->setCellValue('C' . $row, $payment['owner_name']);
                $sheet->setCellValue('D' . $row, $payment['owner_dui_formatted']);
                $sheet->setCellValue('E' . $row, $payment['owner_email']);
                $sheet->setCellValue('F' . $row, $payment['owner_number']);
                $sheet->setCellValue('G' . $row, $payment['community']);
                $sheet->setCellValue('H' . $row, $payment['description']);
                $sheet->setCellValue('I' . $row, '$' . number_format($payment['amount'], 2));
                $sheet->getStyle('A' . $row . ':I' . $row)->getFont()->setSize(9);
                $row++;
            }
        }
        
        // Ajustar ancho de columnas
        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        // Crear archivo temporal
        $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);
        
        $filename = 'reporte_cobros_' . $reportType . '_' . now()->format('Y-m-d_His') . '.xlsx';
        
        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Obtiene los pagos detallados para exportación
     */
    private function getDetailedPayments(string $reportType, Carbon $carbonDate, ?string $community): array
    {
        switch ($reportType) {
            case 'day':
                $startDate = $carbonDate->copy()->startOfDay();
                $endDate = $carbonDate->copy()->endOfDay();
                break;
            case 'week':
                $startDate = $carbonDate->copy()->startOfWeek();
                $endDate = $carbonDate->copy()->endOfWeek();
                break;
            case 'month':
                $startDate = $carbonDate->copy()->startOfMonth();
                $endDate = $carbonDate->copy()->endOfMonth();
                break;
            case 'year':
                $startDate = $carbonDate->copy()->startOfYear();
                $endDate = $carbonDate->copy()->endOfYear();
                break;
            default:
                $startDate = $carbonDate->copy()->startOfDay();
                $endDate = $carbonDate->copy()->endOfDay();
        }

        $allPayments = [];
        
        $monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        // Función helper para formatear DUI
        $formatDui = function($dui) {
            if (!$dui || strlen($dui) !== 9) {
                return $dui ?? 'N/A';
            }
            return substr($dui, 0, 8) . '-' . substr($dui, 8, 1);
        };

        // Pagos mensuales
        $monthlyQuery = MonthlyPayment::with(['waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($community) {
            $monthlyQuery->whereHas('waterConnection', fn($q) => $q->where('community', $community));
        }
        foreach ($monthlyQuery->get() as $p) {
            if ($p->waterConnection && $p->waterConnection->owner) {
                // Construir descripción de meses pagados
                $description = 'Servicio Agua ';
                if ($p->months_paid && count($p->months_paid) > 0) {
                    $monthsDesc = [];
                    foreach ($p->months_paid as $mp) {
                        $monthsDesc[] = $monthNames[$mp['month'] - 1] . '/' . $mp['year'];
                    }
                    $description .= implode(', ', $monthsDesc);
                } else {
                    $description .= $monthNames[$p->payment_month - 1] . '/' . $p->payment_year;
                }
                
                $allPayments[] = [
                    'receipt_number' => $p->receipt_number,
                    'payment_date' => $p->payment_date,
                    'payment_datetime' => \Carbon\Carbon::parse($p->payment_date)->format('d/m/Y H:i'),
                    'owner_name' => $p->waterConnection->owner->name,
                    'owner_dui' => $p->waterConnection->owner->dui ?? 'N/A',
                    'owner_dui_formatted' => $formatDui($p->waterConnection->owner->dui),
                    'owner_email' => $p->waterConnection->owner->email ?? 'N/A',
                    'owner_number' => $p->waterConnection->owner_number,
                    'community' => $p->waterConnection->community,
                    'description' => $description,
                    'amount' => $p->total_amount,
                ];
            }
        }

        // Otros pagos
        $otherQuery = OtherPayment::with(['waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($community) {
            $otherQuery->whereHas('waterConnection', fn($q) => $q->where('community', $community));
        }
        foreach ($otherQuery->get() as $p) {
            if ($p->waterConnection && $p->waterConnection->owner) {
                $allPayments[] = [
                    'receipt_number' => $p->receipt_number,
                    'payment_date' => $p->payment_date,
                    'payment_datetime' => \Carbon\Carbon::parse($p->payment_date)->format('d/m/Y H:i'),
                    'owner_name' => $p->waterConnection->owner->name,
                    'owner_dui' => $p->waterConnection->owner->dui ?? 'N/A',
                    'owner_dui_formatted' => $formatDui($p->waterConnection->owner->dui),
                    'owner_email' => $p->waterConnection->owner->email ?? 'N/A',
                    'owner_number' => $p->waterConnection->owner_number,
                    'community' => $p->waterConnection->community,
                    'description' => OtherPayment::PAYMENT_TYPES[$p->payment_type] ?? $p->payment_type,
                    'amount' => $p->amount,
                ];
            }
        }

        // Pagos de cuotas
        $installmentQuery = InstallmentPlanPayment::with(['installmentPlan.waterConnection.owner'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($community) {
            $installmentQuery->whereHas('installmentPlan.waterConnection', fn($q) => $q->where('community', $community));
        }
        foreach ($installmentQuery->get() as $p) {
            if ($p->installmentPlan && $p->installmentPlan->waterConnection && $p->installmentPlan->waterConnection->owner) {
                // Determinar tipo de cuota usando las constantes del modelo
                $planTypeLabel = \App\Models\InstallmentPlan::PLAN_TYPES[$p->installmentPlan->plan_type] ?? $p->installmentPlan->plan_type;
                $description = 'Cuota ' . $planTypeLabel;
                
                $allPayments[] = [
                    'receipt_number' => $p->receipt_number,
                    'payment_date' => $p->payment_date,
                    'payment_datetime' => \Carbon\Carbon::parse($p->payment_date)->format('d/m/Y H:i'),
                    'owner_name' => $p->installmentPlan->waterConnection->owner->name,
                    'owner_dui' => $p->installmentPlan->waterConnection->owner->dui ?? 'N/A',
                    'owner_dui_formatted' => $formatDui($p->installmentPlan->waterConnection->owner->dui),
                    'owner_email' => $p->installmentPlan->waterConnection->owner->email ?? 'N/A',
                    'owner_number' => $p->installmentPlan->waterConnection->owner_number,
                    'community' => $p->installmentPlan->waterConnection->community,
                    'description' => $description,
                    'amount' => $p->amount_paid,
                ];
            }
        }

        // Ordenar por fecha
        usort($allPayments, fn($a, $b) => strcmp($a['payment_date'], $b['payment_date']));

        return $allPayments;
    }

    /**
     * Exporta el reporte a PDF
     */
    public function exportPdf(Request $request)
    {
        $reportType = $request->input('report_type', 'day');
        $date = $request->input('date', now()->format('Y-m-d'));
        $community = $request->input('community', '');

        $reportData = $this->generateReport($reportType, $date, $community);
        
        // Obtener pagos detallados
        $carbonDate = Carbon::parse($date);
        $detailedData = $this->getDetailedPayments($reportType, $carbonDate, $community);

        // Generar HTML para el PDF
        $html = view('reports.pdf', [
            'reportData' => $reportData,
            'detailedData' => $detailedData,
        ])->render();

        // Configurar DOMPDF
        $options = new \Dompdf\Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);
        
        $dompdf = new \Dompdf\Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('letter', 'portrait');
        $dompdf->render();

        $filename = 'reporte_cobros_' . $reportType . '_' . now()->format('Y-m-d_His') . '.pdf';

        return response()->streamDownload(function() use ($dompdf) {
            echo $dompdf->output();
        }, $filename);
    }
}