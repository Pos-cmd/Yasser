Add-Type -AssemblyName System.Drawing

$path = Join-Path $PSScriptRoot '..\public\profile_mascot.png'
$bmp = New-Object System.Drawing.Bitmap((Resolve-Path $path).Path)

function Profile($label, $x, $y0, $y1) {
  Write-Host "== $label (x=$x, y=$y0..$y1) =="
  $line = @()
  for ($y = $y0; $y -le $y1; $y += 1) {
    $line += "$y=$($bmp.GetPixel($x, $y).A)"
  }
  Write-Host ($line -join ' ')
}

Profile 'Bas vignette r0c0' 321 356 384
Profile 'Bas vignette r1c1' 720 710 740
Profile 'Haut vignette r0c0' 321 24 40

Write-Host '== Horizontal r0c0 (y=200, x=120..145) =='
$line = @()
for ($x = 120; $x -le 145; $x++) { $line += "$x=$($bmp.GetPixel($x, 200).A)" }
Write-Host ($line -join ' ')

Write-Host '== Horizontal r0c0 (y=200, x=485..520) =='
$line = @()
for ($x = 485; $x -le 520; $x++) { $line += "$x=$($bmp.GetPixel($x, 200).A)" }
Write-Host ($line -join ' ')

$bmp.Dispose()
