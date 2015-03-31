import System;
import System.Diagnostics;
import System.Collections;
import System.IO;
import System.Text;

var args: String[] = Environment.GetCommandLineArgs();
var files: String[];
var pwd: DirectoryInfo = new DirectoryInfo(".");
var utf8: Encoding = new UTF8Encoding(false);

if (args.Length == 1) {
    files = [args[0], "*.jss"];
} else {
    files = args;
}

for (var i = 1; i < files.Length; i++) {
    var fileOrPattern : String = files[i];
    if (fileOrPattern.Contains("*")) {
        var expanded : IEnumerator =
            pwd.EnumerateFiles(fileOrPattern).GetEnumerator();
        while (expanded.MoveNext()) {
            Compile(expanded.Current);
        }
    } else {
        Compile(new FileInfo(fileOrPattern));
    }
}

function Compile(file : FileInfo) {
    if (!file.Exists)
        throw new ArgumentException("File \"" + file.FullName + "\"" +
                " does not exist!", "file");

    var startInfo : ProcessStartInfo = null;
    var fileExt : String = file.Extension.ToUpperInvariant();
    var fileIsLibrary : Boolean = Char.IsUpper(file.Name, 0);
    var isSelf : Boolean = file.Name == "jssc.jss";
    var quotedFile : String = "\"" + file.FullName + "\"";
    var bashFileName : String = file.FullName.Substring(0,
            file.FullName.Length - fileExt.Length);
    var batchFileName : String = bashFileName + ".cmd";

    switch (fileExt) {
        case ".JSS":
            var options : String =
                (fileIsLibrary ? "/t:library " : "") +
                "/codepage:65001 /nologo /fast+ ";

            var target : String;
            
            if (isSelf) {
                target = "%EXE%"
                startInfo = null;
            } else {
                target = "%~dpn0." + (fileIsLibrary ? "dll" : "exe");
                startInfo = new ProcessStartInfo("jsc",
                        options + "/utf8output " + quotedFile);
            }
            
            var quotedTarget : String = '"' + target + '"';
            
            var batchFile : String;
            if (isSelf) {
                batchFile =
                    "@setlocal enabledelayedexpansion enableextensions\n" +
                    "@for /F \"usebackq\" %%G in (" +
                    "`git rev-parse --short HEAD 2^>nul ^|^| " +
                    "echo UNVERSIONED`) do @set ID=%%G\n" +
                    "@set EXE=%TEMP%\\_jssc_%ID%.exe\n" +
                    "@if not exist \"%EXE%\" (\n" +
                    "    jsc " + options + "/out:" + quotedTarget + " " +
                    "\"%~dpn0.jss\"\n" +
                    ")\n" +
                    "@call " + quotedTarget + " %*\n";
            } else {
                batchFile =
                    "@setlocal enabledelayedexpansion enableextensions\n" +
                    "@jsc " + options + "/out:" + quotedTarget + " " +
                    "\"%~dpn0.jss\"" +
                    (fileIsLibrary ? "\n" : " && " + quotedTarget + " %*\n");
            }
            File.WriteAllText(batchFileName, batchFile, utf8);
            break;
        default:
            throw new ArgumentException(
                    "Extension \"" + file.Extension + "\"" + 
                    "is not supported!", "file");
            break;
    }

    if (startInfo != null) {
        Console.Out.WriteLine("Compiling {0}", file.FullName);
        startInfo.UseShellExecute = false;
        startInfo.CreateNoWindow = true;
        startInfo.RedirectStandardOutput = true;
        var proc : Process = Process.Start(startInfo);
        Console.Write(proc.StandardOutput.ReadToEnd());
        proc.WaitForExit();
    }
}
