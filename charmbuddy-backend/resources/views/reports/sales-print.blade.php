<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sales Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 20px; }
    h1 { margin: 0 0 6px 0; }
    .meta { margin: 0 0 4px 0; font-size: 12px; color: #555; }
    .summary { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .box { border: 1px solid #ddd; border-radius: 6px; padding: 8px; font-size: 12px; }
    table { width: 100%; margin-top: 14px; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px; font-size: 11px; }
    th { background: #f5f5f5; text-align: left; }
    td.num { text-align: right; }
  </style>
</head>
<body>
  <h1>Laporan Penjualan</h1>
  <p class="meta">Dicetak: {{ $printedAt->format('Y-m-d H:i:s') }}</p>
  <p class="meta">Periode: {{ $report['range']['from'] ?? '-' }} sampai {{ $report['range']['to'] ?? '-' }}</p>

  <div class="summary">
    <div class="box">Total Transaksi: {{ $report['summary']['total_transactions'] ?? 0 }}</div>
    <div class="box">Paid: {{ $report['summary']['paid_transactions'] ?? 0 }}</div>
    <div class="box">Pending: {{ $report['summary']['pending_transactions'] ?? 0 }}</div>
    <div class="box">Gross Revenue: {{ number_format((float) ($report['summary']['gross_revenue'] ?? 0), 2, '.', '') }}</div>
    <div class="box">Total Shipping: {{ number_format((float) ($report['summary']['total_shipping'] ?? 0), 2, '.', '') }}</div>
    <div class="box">Total Discount: {{ number_format((float) ($report['summary']['total_discount'] ?? 0), 2, '.', '') }}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Order</th>
        <th>Date</th>
        <th>Customer</th>
        <th>Status</th>
        <th>Payment</th>
        <th>Items</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      @forelse(($report['rows'] ?? []) as $row)
        <tr>
          <td>{{ $row['order_number'] }}</td>
          <td>{{ $row['order_date'] ? \Carbon\Carbon::parse($row['order_date'])->format('Y-m-d') : '-' }}</td>
          <td>{{ $row['customer_name'] }}</td>
          <td>{{ $row['status'] }}</td>
          <td>{{ $row['payment_status'] }}</td>
          <td class="num">{{ $row['items_count'] }}</td>
          <td class="num">{{ number_format((float) $row['total_amount'], 2, '.', '') }}</td>
        </tr>
      @empty
        <tr>
          <td colspan="7">Tidak ada data transaksi.</td>
        </tr>
      @endforelse
    </tbody>
  </table>
</body>
</html>
