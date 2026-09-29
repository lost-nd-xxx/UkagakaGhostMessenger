<#
.SYNOPSIS
    Downloads the tools listed in tools/tools.json (tamac.exe) into tools/bin/.
.DESCRIPTION
    Adapted for UkagakaGhostMessenger (a PLUGIN) from the ghost development kit of konnoyayame:
    the git submodule step and the tools/doctor.ps1 report of the kit are removed.
    Exit codes: 0 = OK, 1 = a download failed.
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools/setup.ps1
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools/setup.ps1 -Tool tamac -Force
#>
[CmdletBinding()]
param(
    [string[]]$Tool,
    [switch]$Force
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/common.ps1')
Initialize-DevkitConsole

$failed = 0

# --- pinned tools ----------------------------------------------------------------------
$manifest = Get-DevkitToolManifest
$names = @($manifest.PSObject.Properties.Name)
if ($Tool) {
    foreach ($name in $Tool) {
        if ($names -notcontains $name) { throw "Unknown tool '$name'. Available: $($names -join ', ')" }
    }
    $names = $Tool
}

[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'
New-Item -ItemType Directory -Force -Path $DevkitBinDir | Out-Null

foreach ($name in $names) {
    $entry = $manifest.$name
    $exePath = Join-Path $DevkitBinDir $entry.exe
    $installed = Test-Path -LiteralPath $exePath
    $label = "$name $($entry.version)"
    $url = [string]$entry.url
    $sha256 = [string]$entry.sha256
    if ($entry.version -eq 'latest') {
        # Follows the latest release; the download is checked against the SHA256 digest that GitHub publishes.
        try {
            $release = Get-DevkitLatestReleaseAsset $entry.repository $entry.asset
        } catch {
            if ($installed -and (Test-DevkitToolCurrent $name)) {
                Write-Host "[skip] $name is installed, but its latest release could not be checked: $($_.Exception.Message)"
            } else {
                $failed++
                Write-Host "[error] $name : could not look up the latest release of $($entry.repository): $($_.Exception.Message)"
            }
            continue
        }
        if (-not $release.Sha256) {
            $failed++
            Write-Host "[error] $name : release $($release.Tag) of $($entry.repository) has no SHA256 digest to check the download against"
            continue
        }
        $label = "$name $($release.Tag) (latest)"
        $url = $release.Url
        $sha256 = $release.Sha256
    }
    if ($installed -and -not $Force) {
        if ($entry.version -eq 'latest' -and $entry.type -eq 'exe') {
            $current = (Get-FileHash -LiteralPath $exePath -Algorithm SHA256).Hash -eq $sha256
        } else {
            $current = Test-DevkitToolCurrent $name
        }
        if ($current) {
            Write-Host "[skip] $label is already installed: $exePath"
            continue
        }
        Write-Host "[update] $label : the installed file is a different version"
    }

    Write-Host "[download] $label <- $url"
    $tmp = Join-Path ([IO.Path]::GetTempPath()) ('devkit-' + [guid]::NewGuid().ToString('N') + '-' + [IO.Path]::GetFileName($url))
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $tmp
        $hash = (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash
        if ($hash -ne $sha256.ToUpperInvariant()) {
            throw "SHA256 mismatch (expected $sha256, got $hash)"
        }
        if ($entry.type -eq 'zip') {
            $dest = Join-Path $DevkitBinDir $entry.installDir
            if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
            Expand-Archive -LiteralPath $tmp -DestinationPath $dest
        } else {
            New-Item -ItemType Directory -Force -Path (Split-Path $exePath -Parent) | Out-Null
            Copy-Item -LiteralPath $tmp -Destination $exePath -Force
        }
        if (-not (Test-Path -LiteralPath $exePath)) { throw "$($entry.exe) was not found after installing" }
        Write-Host "[ok] $name -> $exePath"
    } catch {
        $failed++
        Write-Host "[error] $name : $($_.Exception.Message)"
        Write-Host '        If antivirus software removed the file, it may be a false positive; check the release page.'
    } finally {
        if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
    }
}

if ($failed -gt 0) { exit 1 }
exit 0
