# -----------------------------------------
# Script PowerShell para subir todo a GitHub
# Incluye archivos ocultos
# -----------------------------------------

$CommitMessage = "Subiendo todos los archivos, incluidos ocultos"

# Verificar si existe repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "No hay repositorio Git. Inicializando..."
    git init
    git branch -M main
}

# Verificar si existe remoto
$remote = git remote
if (-not $remote) {
    $RemoteURL = Read-Host "No se encontró remoto. Ingresa la URL de tu repositorio GitHub"
    git remote add origin $RemoteURL
}

# Listar archivos ignorados por Git
$ignored = git ls-files --others --ignored --exclude-standard
if ($ignored) {
    Write-Host "⚠️ Estos archivos están en .gitignore y no se subirán:"
    $ignored
}

# Agregar todos los archivos (incluidos ocultos)
git add -A

# Crear commit
git commit -m "$CommitMessage"

# Hacer push al repositorio
git push -u origin main

Write-Host "✅ Todos los archivos (incluidos ocultos) se subieron correctamente."
