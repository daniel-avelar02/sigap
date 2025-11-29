<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Microsoft Excel 15">
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 10pt;
            color: #666;
        }
        .summary {
            margin-bottom: 20px;
        }
        .summary table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
        }
        .summary .label {
            font-size: 9pt;
            color: #666;
            text-transform: uppercase;
        }
        .summary .amount {
            font-size: 13pt;
            font-weight: bold;
        }
        .summary .count {
            font-size: 8pt;
            color: #555;
        }
        .summary .total-cell {
            background-color: #f3f4f6;
            border: 2px solid #333;
        }
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #666;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table.data-table th {
            background-color: #f3f4f6;
            padding: 8px;
            text-align: left;
            border: 1px solid #333;
            font-weight: bold;
            font-size: 9pt;
            text-transform: uppercase;
        }
        table.data-table td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $reportData['title'] }}</h1>
        <p>Período: {{ $reportData['period']['start_formatted'] }} - {{ $reportData['period']['end_formatted'] }}</p>
        <p>Generado el: {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <div class="summary">
        <table>
            <tr>
                <td>
                    <div class="label">Pagos Mensuales</div>
                    <div class="amount">${{ number_format($reportData['summary']['monthly']['total'], 2) }}</div>
                    <div class="count">{{ $reportData['summary']['monthly']['count'] }} pago(s)</div>
                </td>
                <td>
                    <div class="label">Otros Pagos</div>
                    <div class="amount">${{ number_format($reportData['summary']['other']['total'], 2) }}</div>
                    <div class="count">{{ $reportData['summary']['other']['count'] }} pago(s)</div>
                </td>
                <td>
                    <div class="label">Pagos de Cuotas</div>
                    <div class="amount">${{ number_format($reportData['summary']['installment']['total'], 2) }}</div>
                    <div class="count">{{ $reportData['summary']['installment']['count'] }} pago(s)</div>
                </td>
                <td class="total-cell">
                    <div class="label">Total General</div>
                    <div class="amount">${{ number_format($reportData['summary']['grand_total'], 2) }}</div>
                    <div class="count">{{ $reportData['summary']['total_payments'] }} pago(s)</div>
                </td>
            </tr>
        </table>
    </div>

    @if(count($reportData['other_payments_by_type']) > 0)
    <div class="section-title">Desglose de Otros Pagos</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Tipo de Pago</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reportData['other_payments_by_type'] as $type)
            <tr>
                <td>{{ $type['type_label'] }}</td>
                <td class="text-right">{{ $type['count'] }}</td>
                <td class="text-right">${{ number_format($type['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($detailedData) > 0)
    <div class="section-title">Detalle de Pagos</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>N° Ticket</th>
                <th>Fecha/Hora</th>
                <th>Propietario</th>
                <th>DUI</th>
                <th>Correo</th>
                <th>No. Paja</th>
                <th>Comunidad</th>
                <th>Tipo/Descripción</th>
                <th class="text-right">Valor</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detailedData as $payment)
            <tr>
                <td>{{ $payment['receipt_number'] }}</td>
                <td>{{ $payment['payment_datetime'] }}</td>
                <td>{{ $payment['owner_name'] }}</td>
                <td>{{ $payment['owner_dui_formatted'] }}</td>
                <td>{{ $payment['owner_email'] }}</td>
                <td>{{ $payment['owner_number'] }}</td>
                <td>{{ $payment['community'] }}</td>
                <td>{{ $payment['description'] }}</td>
                <td class="text-right">${{ number_format($payment['amount'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
</body>
</html>
