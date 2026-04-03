Set WshShell = CreateObject("WScript.Shell")
' Get the current directory of the script
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Run the node server hidden (0 means hidden window)
' Note: We assume node is in the system PATH. 
' We run server.js from its directory.
WshShell.CurrentDirectory = strPath & "\src\backend"
WshShell.Run "node server.js", 0, False

WScript.Quit
