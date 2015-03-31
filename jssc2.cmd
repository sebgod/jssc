@setlocal enabledelayedexpansion enableextensions
@for /F "usebackq" %%G in (`git rev-parse --short HEAD 2^>nul ^|^| echo UNVERSIONED`) do @set ID=%%G
@set EXE=%TEMP%\_jssc_%ID%.exe
@if not exist "%EXE%" (
    jsc /codepage:65001 /nologo /fast+ /out:"%EXE%" "%~dp0jssc.jss"
)
@call "%EXE%" %*
