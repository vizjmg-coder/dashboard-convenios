# generar_indices_fotos.ps1
# Genera un index.json en cada carpeta de convenio con la lista de fotos
# Guarda las rutas relativas desde la carpeta raiz del convenio
# Ejecutar: .\generar_indices_fotos.ps1

$fotosRoot = ".\assets\fotos"
$extValidas = @(".jpg", ".jpeg", ".png", ".jfif", ".JPG", ".JPEG", ".PNG", ".JFIF")

$convenios = Get-ChildItem $fotosRoot -Directory

foreach ($conv in $convenios) {
    $index = [ordered]@{
        convenio = $conv.Name
        antes    = [System.Collections.ArrayList]@()
        durante  = [System.Collections.ArrayList]@()
        despues  = [System.Collections.ArrayList]@()
    }

    $subDirs = Get-ChildItem $conv.FullName -Directory

    foreach ($sub in $subDirs) {
        $nombre = $sub.Name.ToLower()
        $key = $null
        if ($nombre -match "antes") { $key = "antes" }
        elseif ($nombre -match "durante") { $key = "durante" }
        elseif ($nombre -match "despu") { $key = "despues" }

        if ($key -ne $null) {
            # Busqueda recursiva, guardar ruta relativa desde la raiz del convenio
            $fotos = Get-ChildItem $sub.FullName -File -Recurse |
                     Where-Object { $extValidas -contains $_.Extension } |
                     Sort-Object Name |
                     ForEach-Object {
                         # Ruta relativa desde la carpeta del convenio (incluye subdir Antes/Despues/)
                         $_.FullName.Replace($conv.FullName + "\", "").Replace("\", "/")
                     }
            foreach ($f in $fotos) {
                [void]$index[$key].Add($f)
            }
        }
    }

    $jsonObj = [ordered]@{
        convenio = $index.convenio
        antes    = @($index.antes)
        durante  = @($index.durante)
        despues  = @($index.despues)
    }

    $jsonPath = Join-Path $conv.FullName "index.json"
    $jsonObj | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8
    $total = $index.antes.Count + $index.durante.Count + $index.despues.Count
    Write-Host "OK $($conv.Name) -> $($index.antes.Count) antes | $($index.durante.Count) durante | $($index.despues.Count) despues ($total fotos)"
}

Write-Host "LISTO: Indices generados para $($convenios.Count) convenios."
