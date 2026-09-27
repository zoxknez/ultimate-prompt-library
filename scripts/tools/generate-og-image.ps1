# Generates the 1200x630 social share image (site-src/promptlibrary-og-v2.jpg) with Windows GDI+.
#
# Why a script: the previous image (promptlibrary-og.jpg) was a corrupt progressive JPEG (a 0xFF byte
# inside the entropy-coded data without the required 0x00 stuffing), so browsers and Facebook
# rendered a flat grey box. This script draws the image from the brand colours and the logo in
# site-src/upl-mark.svg and saves a baseline JPEG. `node scripts/validate-site.mjs` checks the
# result structurally on every build.
#
# Usage (Windows PowerShell 5.1+):  powershell -File scripts/tools/generate-og-image.ps1
# When the text or design changes, save under a new file name so social networks do not keep
# showing the cached old image, and update OG_IMAGE_PATH in scripts/generate-site.mjs.

param([string]$Out = (Join-Path $PSScriptRoot '..\..\site-src\promptlibrary-og-v2.jpg'))

Add-Type -AssemblyName System.Drawing
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function C([string]$hex, [int]$a = 255) {
  $v = [Convert]::ToInt32($hex.TrimStart('#'), 16)
  [System.Drawing.Color]::FromArgb($a, ($v -shr 16) -band 255, ($v -shr 8) -band 255, $v -band 255)
}
function RoundRect([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $r
  $p.AddArc($x, $y, $d, $d, 180, 90); $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure(); $p
}

# Background: deep navy diagonal gradient with soft blue and gold glows.
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point $W, $H), (C '#0b2034'), (C '#193c59')
$g.FillRectangle($bg, 0, 0, $W, $H)
foreach ($glow in @(@{x = 930; y = -180; r = 520; c = '#2e8ad0'; a = 38 }, @{x = 1010; y = 470; r = 420; c = '#c18b2f'; a = 30 })) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse([float]($glow.x - $glow.r), [float]($glow.y - $glow.r), [float](2 * $glow.r), [float](2 * $glow.r))
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
  $pgb.CenterColor = C $glow.c $glow.a
  $pgb.SurroundColors = [System.Drawing.Color[]]@((C $glow.c 0))
  $g.FillPath($pgb, $path)
}
# Subtle dotted grid on the right.
$dot = New-Object System.Drawing.SolidBrush (C '#ffffff' 18)
for ($x = 760; $x -lt $W; $x += 28) { for ($y = 40; $y -lt $H - 40; $y += 28) { $g.FillEllipse($dot, $x, $y, 3, 3) } }

# Logo mark (scaled from the 128x128 viewBox of site-src/upl-mark.svg).
$s = 1.25; $ox = 80; $oy = 70
$g.TranslateTransform($ox, $oy); $g.ScaleTransform($s, $s)
$mark = RoundRect 3 3 122 122 34
$markBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point 128, 128), (C '#193c59'), (C '#0b2034')
$g.FillPath($markBrush, $mark)
$g.DrawPath((New-Object System.Drawing.Pen (C '#ffffff' 40), 3), $mark)
$gold = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 20, 20), (New-Object System.Drawing.Point 108, 108), (C '#f4d996'), (C '#c18b2f')
$goldPen = New-Object System.Drawing.Pen $gold, 5
$goldPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$goldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $goldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$left = New-Object System.Drawing.Drawing2D.GraphicsPath
$left.AddBezier(27, 41, 40, 36, 52, 38, 64, 46); $left.AddLine(64, 46, 64, 94); $left.AddBezier(64, 94, 52, 86, 40, 84, 27, 89); $left.CloseFigure()
$right = New-Object System.Drawing.Drawing2D.GraphicsPath
$right.AddBezier(101, 41, 88, 36, 76, 38, 64, 46); $right.AddLine(64, 46, 64, 94); $right.AddBezier(64, 94, 76, 86, 88, 84, 101, 89); $right.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush (C '#e4b85a' 23)), $left)
$g.FillPath((New-Object System.Drawing.SolidBrush (C '#f7f9fc' 15)), $right)
$g.DrawPath($goldPen, $left); $g.DrawPath($goldPen, $right)
$spine = New-Object System.Drawing.Pen (C '#f8f3e7'), 4; $spine.StartCap = 'Round'; $spine.EndCap = 'Round'
$g.DrawLine($spine, 64, 47, 64, 94)
$linePen = New-Object System.Drawing.Pen (C '#dce6ed'), 3.5; $linePen.StartCap = 'Round'; $linePen.EndCap = 'Round'
$g.DrawBezier($linePen, 36, 55, 43, 53, 49, 54, 55, 57); $g.DrawBezier($linePen, 36, 67, 43, 65, 49, 66, 55, 69)
$g.DrawBezier($linePen, 92, 55, 85, 53, 79, 54, 73, 57); $g.DrawBezier($linePen, 92, 67, 85, 65, 79, 66, 73, 69)
$spark = New-Object System.Drawing.Drawing2D.GraphicsPath
$spark.AddPolygon([System.Drawing.PointF[]]@(
  (New-Object System.Drawing.PointF 92, 25), (New-Object System.Drawing.PointF 94.5, 30.5), (New-Object System.Drawing.PointF 100, 33),
  (New-Object System.Drawing.PointF 94.5, 35.5), (New-Object System.Drawing.PointF 92, 41), (New-Object System.Drawing.PointF 89.5, 35.5),
  (New-Object System.Drawing.PointF 84, 33), (New-Object System.Drawing.PointF 89.5, 30.5)))
$g.FillPath($gold, $spark)
$g.ResetTransform()

# Text.
$white = New-Object System.Drawing.SolidBrush (C '#ffffff')
$soft = New-Object System.Drawing.SolidBrush (C '#c9d6e2')
$goldText = New-Object System.Drawing.SolidBrush (C '#e8c46e')
$fmt = [System.Drawing.StringFormat]::GenericTypographic
$g.DrawString('PROMPT LIBRARY', (New-Object System.Drawing.Font 'Segoe UI Semibold', 22), $goldText, 262, 104, $fmt)
$g.DrawString('promptlibrary.pro', (New-Object System.Drawing.Font 'Segoe UI', 20), $soft, 263, 142, $fmt)
$title = New-Object System.Drawing.Font 'Segoe UI Semibold', 60
$g.DrawString('1,000 production-grade', $title, $white, 72, 252, $fmt)
$g.DrawString('AI prompts', $title, $white, 72, 336, $fmt)
$g.DrawString('Evidence-first prompts for real professional work, in English and Serbian.', (New-Object System.Drawing.Font 'Segoe UI', 24), $soft, 76, 458, $fmt)

# Chips: collection facts.
$chipFont = New-Object System.Drawing.Font 'Segoe UI Semibold', 18
$chipX = 76
foreach ($label in @('10 categories', '100 subcategories', 'EN / SR', 'Open source')) {
  $size = $g.MeasureString($label, $chipFont, 1000, $fmt)
  $w = [float]$size.Width + 40
  $chip = RoundRect $chipX 534 $w 46 23
  $g.FillPath((New-Object System.Drawing.SolidBrush (C '#ffffff' 20)), $chip)
  $g.DrawPath((New-Object System.Drawing.Pen (C '#ffffff' 55), 1.5), $chip)
  $g.DrawString($label, $chipFont, $white, $chipX + 20, 544, $fmt)
  $chipX += $w + 14
}

# Save as baseline JPEG, quality 90.
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
$full = [System.IO.Path]::GetFullPath($Out)
$bmp.Save($full, $codec, $params)
$g.Dispose(); $bmp.Dispose()
Write-Output "wrote $full ($((Get-Item $full).Length) bytes)"
