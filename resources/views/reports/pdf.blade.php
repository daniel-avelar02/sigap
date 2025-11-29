<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $reportData['title'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 12px;
            color: #666;
        }
        .summary {
            margin-bottom: 30px;
        }
        .summary-grid {
            display: table;
            width: 100%;
            table-layout: fixed;
        }
        .summary-grid > div {
            display: table-cell;
            width: 25%;
            padding: 0 5px;
        }
        .summary-card {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
        }
        .summary-card h3 {
            font-size: 9px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .summary-card .amount {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        .summary-card .count {
            font-size: 8px;
            color: #555;
            margin-top: 2px;
        }
        .total-card {
            background-color: #f3f4f6;
            border: 2px solid #333;
            padding: 10px;
        }
        .total-card h3 {
            font-size: 10px;
            color: #333;
            margin-bottom: 5px;
        }
        .total-card .amount {
            font-size: 16px;
            font-weight: bold;
            color: #111;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 9px;
            table-layout: fixed;
        }
        table th:nth-child(1) { width: 8%; }  /* N° Ticket */
        table th:nth-child(2) { width: 13%; } /* Fecha/Hora */
        table th:nth-child(3) { width: 15%; } /* Propietario */
        table th:nth-child(4) { width: 10%; }  /* DUI */
        table th:nth-child(5) { width: 17%; } /* Correo */
        table th:nth-child(6) { width: 6%; }  /* No. Paja */
        table th:nth-child(7) { width: 9%; }  /* Comunidad */
        table th:nth-child(8) { width: 13%; } /* Tipo/Descripción */
        table th:nth-child(9) { width: 9%; }  /* Valor */
        table td {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        /* Columnas que no deben cortarse */
        table td:nth-child(1),  /* N° Ticket */
        table td:nth-child(2),  /* Fecha/Hora */
        table td:nth-child(3),  /* Propietario */
        table td:nth-child(4),  /* DUI */
        table td:nth-child(5) { /* Correo */
            white-space: nowrap;
        }
        table thead {
            background-color: #f3f4f6;
        }
        table th {
            padding: 6px 4px;
            text-align: left;
            border-bottom: 2px solid #333;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }
        table td {
            padding: 5px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }
        table tbody tr:last-child td {
            border-bottom: 2px solid #333;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #666;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #888;
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
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Pagos Mensuales</h3>
                <div class="amount">${{ number_format($reportData['summary']['monthly']['total'], 2) }}</div>
                <div class="count">{{ $reportData['summary']['monthly']['count'] }} pago(s)</div>
            </div>

            <div class="summary-card">
                <h3>Otros Pagos</h3>
                <div class="amount">${{ number_format($reportData['summary']['other']['total'], 2) }}</div>
                <div class="count">{{ $reportData['summary']['other']['count'] }} pago(s)</div>
            </div>

            <div class="summary-card">
                <h3>Pagos de Cuotas</h3>
                <div class="amount">${{ number_format($reportData['summary']['installment']['total'], 2) }}</div>
                <div class="count">{{ $reportData['summary']['installment']['count'] }} pago(s)</div>
            </div>

            <div class="summary-card total-card">
                <h3>Total General</h3>
                <div class="amount">${{ number_format($reportData['summary']['grand_total'], 2) }}</div>
                <div class="count">{{ $reportData['summary']['total_payments'] }} pago(s)</div>
            </div>
        </div>
    </div>

    @if(count($reportData['other_payments_by_type']) > 0)
    <div class="section-title">Desglose de Otros Pagos</div>
    <table>
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
    <table>
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

    <div class="footer">
        <p>Sistema de Gestión de Agua Potable (SIGAP)</p>
    </div>
</body>
</html>