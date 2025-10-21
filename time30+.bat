@echo off
:: Adiciona 31 dias à data atual e atualiza o sistema para 23:59:00h

:: Obtém a data atual no formato AAAA-MM-DD
for /f %%a in ('powershell -command "Get-Date -Format yyyy-MM-dd"') do set dataAtual=%%a

:: Calcula a nova data com +31 dias no formato AAAA-MM-DD
for /f %%a in ('powershell -command "(Get-Date).AddDays(31).ToString(\"yyyy-MM-dd\")"') do set novaData=%%a

echo Data atual: %dataAtual%
echo Nova data: %novaData% às 23:59:00

:: Altera a data e a hora do sistema usando PowerShell
powershell -command "$newDate = (Get-Date).AddDays(31).Date.AddHours(23).AddMinutes(59); Set-Date -Date $newDate"

echo.
echo Data e hora atualizadas com sucesso!
time
cmd
pause
