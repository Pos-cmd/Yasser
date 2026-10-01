Add-Type -AssemblyName System.Drawing

$path = Join-Path $PSScriptRoot '..\public\profile_mascot.png'
$bmp = New-Object System.Drawing.Bitmap((Resolve-Path $path).Path)
$w = $bmp.Width; $h = $bmp.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($data)

function A($x, $y) { return $bytes[($y * $stride) + ($x * 4) + 3] }

# --- 1. Bandes horizontales (lignes) : profondeur par ligne
$rowCounts = New-Object int[] $h
for ($y = 0; $y -lt $h; $y++) {
  $c = 0
  for ($x = 0; $x -lt $w; $x++) { if ((A $x $y) -gt 8) { $c++ } }
  $rowCounts[$y] = $c
}
$rowBands = @()
$in = $true; $start = 0
for ($y = 0; $y -lt $h; $y++) {
  $empty = $rowCounts[$y] -le 2
  if ($in -and -not $empty) { $in = $false; $start = $y }
  elseif (-not $in -and $empty) { $in = $true; $rowBands += , @($start, ($y - 1)) }
}
if (-not $in) { $rowBands += , @($start, $h - 1) }
Write-Host "Bandes lignes: $(($rowBands | ForEach-Object { "$($_[0])..$($_[1])" }) -join ' | ')"

# --- 2. Pour chaque bande, bandes verticales (colonnes)
$cells = @()
foreach ($rb in $rowBands) {
  $y0 = $rb[0]; $y1 = $rb[1]
  $colCounts = New-Object int[] $w
  for ($x = 0; $x -lt $w; $x++) {
    $c = 0
    for ($y = $y0; $y -le $y1; $y++) { if ((A $x $y) -gt 8) { $c++ } }
    $colCounts[$x] = $c
  }
  $colBands = @()
  $in = $true; $start = 0
  for ($x = 0; $x -lt $w; $x++) {
    $empty = $colCounts[$x] -le 1
    if ($in -and -not $empty) { $in = $false; $start = $x }
    elseif (-not $in -and $empty) { $in = $true; $colBands += , @($start, ($x - 1)) }
  }
  if (-not $in) { $colBands += , @($start, $w - 1) }
  foreach ($cb in $colBands) { $cells += , @($cb[0], $cb[1], $y0, $y1) }
}

# --- 3. Bbox de contenu par cellule
$CROP = 356
$PAD_BOTTOM = 3
$i = 0
$table = @()
foreach ($c in $cells) {
  $x0 = $c[0]; $x1 = $c[1]; $y0 = $c[2]; $y1 = $c[3]
  $minX = 99999; $maxX = -1; $minY = 99999; $maxY = -1
  for ($y = $y0; $y -le $y1; $y++) {
    for ($x = $x0; $x -le $x1; $x++) {
      if ((A $x $y) -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $cx = ($minX + $maxX) / 2
  $cropX = [int][math]::Round($cx - $CROP / 2)
  $cropY = [int][math]::Round($maxY + $PAD_BOTTOM - $CROP)
  $row = [math]::Floor($i / 3); $col = $i % 3
  $table += [pscustomobject]@{
    Index = $i; Cell = "r$row c$col"
    Content = "$minX..$maxX / $minY..$maxY"
    Size = "$($maxX - $minX + 1)x$($maxY - $minY + 1)"
    Crop = "[$cropX, $cropY]"
    MarginLeft = $minX - $cropX
    MarginRight = ($cropX + $CROP - 1) - $maxX
    MarginTop = $minY - $cropY
    MarginBottom = ($cropY + $CROP - 1) - $maxY
  }
  $i++
}
$table | Format-Table -AutoSize

# --- 4. Planche de controle des 9 crops
$scale = 110 / $CROP
$thumb = [int]($CROP * $scale)
$sheet = New-Object System.Drawing.Bitmap ($thumb * 3), ($thumb * 3)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(255, 24, 24, 27))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
foreach ($t in $table) {
  $cropX, $cropY = ($t.Crop -replace '[\[\]]', '') -split ',' | ForEach-Object { [int]$_.Trim() }
  $p = [System.Drawing.Point]::new(($t.Index % 3) * $thumb, [math]::Floor($t.Index / 3) * $thumb)
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle $p.X, $p.Y, $thumb, $thumb), (New-Object System.Drawing.Rectangle $cropX, $cropY, $CROP, $CROP), [System.Drawing.GraphicsUnit]::Pixel)
}
$g.Dispose()
$out1 = Join-Path $env:TEMP 'mascot-crops.png'
$sheet.Save($out1, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()

# --- 5. Comparaison pixelated vs lisse a 80 px (cellule centrale, agrandi x5)
$y0 = 329; $x0 = 363
$src = New-Object System.Drawing.Bitmap $CROP, $CROP, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gs = [System.Drawing.Graphics]::FromImage($src)
$gs.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, $CROP, $CROP), (New-Object System.Drawing.Rectangle $x0, $y0, $CROP, $CROP), [System.Drawing.GraphicsUnit]::Pixel)
$gs.Dispose()
$cmp = New-Object System.Drawing.Bitmap 800, 400
$gc = [System.Drawing.Graphics]::FromImage($cmp)
$gc.Clear([System.Drawing.Color]::FromArgb(255, 24, 24, 27))
foreach ($mode in @([System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor, [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic)) {
  $small = New-Object System.Drawing.Bitmap 80, 80
  $gsm = [System.Drawing.Graphics]::FromImage($small)
  $gsm.InterpolationMode = $mode
  $gsm.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gsm.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, 80, 80), (New-Object System.Drawing.Rectangle 0, 0, $CROP, $CROP), [System.Drawing.GraphicsUnit]::Pixel)
  $gsm.Dispose()
  $x = if ($mode -eq [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor) { 0 } else { 400 }
  $gc.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gc.DrawImage($small, (New-Object System.Drawing.Rectangle $x, 0, 400, 400), (New-Object System.Drawing.Rectangle 0, 0, 80, 80), [System.Drawing.GraphicsUnit]::Pixel)
  $small.Dispose()
}
$gc.Dispose()
$out2 = Join-Path $env:TEMP 'mascot-80px-compare.png'
$cmp.Save($out2, [System.Drawing.Imaging.ImageFormat]::Png)
$cmp.Dispose()
$src.Dispose()
$bmp.Dispose()

Write-Host "OUT1=$out1"
Write-Host "OUT2=$out2"
