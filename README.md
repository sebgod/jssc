# jssc

jssc stands for JScript.net script compiler.
In this context, script means the ability to invoke
JScript.net modules directly without manually compiling them.
In this current version, a first manual bootstrap has to be done,
but after the scripts are bootstrapped they are self hosting.

## Bootstrapping

Invoke jssc.cmd or the jssc shell script in the compiler directory,
i.e. the directory this README resides in, this compiles the jssc.jss
module into the %TEMP% directory, which can be safely deleted
Microsoft JScript.net script compiler
