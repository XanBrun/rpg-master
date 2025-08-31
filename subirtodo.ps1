# -----------------------------------------
# Script PowerShell para subir todo a GitHub
# Incluye archivos ocultos y autor del commit
# -----------------------------------------

# Pedir información del autor y GitHub
$AuthorName = Read-Host "Ingresa tu nombre para Git"
$AuthorEmail = Read-Host "Ingresa tu correo para Git"
$GitHubUser = Read-Host "Ingresa tu usuario de GitHub"
$GitHubToken = Read-Host "Ingresa tu token personal (PAT)"  # ya no -AsSecureString

# Configurar Git localmente (solo para este repositorio)
git config user.name "$AuthorName"
git config user.email "$AuthorEmail"

$CommitMessage = "Subiendo todos los archivos, incluidos ocultos"

# Inicializar repo si no existe
if (-not (Test-Path ".git")) {
    Write-Host "No hay repositorio Git. Inicializando..."
    git init
    git branch -M main
}

# Configurar remoto con HTTPS usando usuario y token
$RepoName = "rpg-master"
git remote remove origin 2>$null
$RemoteURL = "https://$GitHubUser`:$GitHubToken@github.com/$GitHubUser/$RepoName.git"
git remote add origin $RemoteURL

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

Write-Host "✅ Todos los archivos (incluidos ocultos) se subieron correctamente como $AuthorName <$AuthorEmail>."
