; SpiceDeck Custom NSIS Installer Script
; Adds a modern look to the NSIS installer

!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInit
  ; Check for existing installation
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpiceDeck" "UninstallString"
  StrCmp $R0 "" done
    MessageBox MB_OKCANCEL|MB_ICONQUESTION \
      "SpiceDeck is already installed. $\n$\nClick OK to remove the previous version or Cancel to cancel this upgrade." \
      IDOK uninst
    Abort
  uninst:
    ExecWait '$R0 /S _?=$INSTDIR'
  done:
!macroend

!macro customInstall
  ; Create SpiceDeck data directory
  CreateDirectory "$APPDATA\spicedeck"
!macroend

!macro customUninstall
  ; Optionally clean up user data on uninstall (commented out to preserve user data)
  ; RMDir /r "$APPDATA\spicedeck"
!macroend
