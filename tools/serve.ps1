# Server statik ringkas untuk uji Cluedo di komputer (tanpa Node.js).
# Guna: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 8090]
# Kemudian buka http://localhost:8090/ dalam browser.
param([int]$Port = 8090, [string]$Root = (Split-Path -Parent $PSScriptRoot))
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8';
  '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'; '.ico'='image/x-icon' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Cluedo: http://localhost:$Port/  (Ctrl+C untuk berhenti)"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    $path = Join-Path $Root $rel
    if ((Test-Path $path -PathType Container)) { $path = Join-Path $path 'index.html' }
    $full = [IO.Path]::GetFullPath($path)
    if (-not $full.StartsWith([IO.Path]::GetFullPath($Root)) -or -not (Test-Path $full -PathType Leaf)) {
      $ctx.Response.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes('404'); $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    } else {
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
      $ctx.Response.Headers.Add('Cache-Control', 'no-store')
      $bytes = [IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
  } catch {} finally { $ctx.Response.Close() }
}
