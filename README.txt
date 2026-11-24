VOICECHAT WINDOWS DESKTOP APP
=============================

What this project does
----------------------
This is an Electron desktop shell for your existing hosted website:
https://mazharvoice.kesug.com/

It loads the live website, so the existing login, user accounts, friends,
groups, chats, PHP API, stored data and WebRTC calls remain on your existing
hosting/backend. It does not create a second database or copy user data.

Included desktop integration
----------------------------
- Windows app window with the existing website UI
- System tray; closing the window hides it instead of quitting
- Start with Windows
- Ctrl + Shift + M global mute shortcut (clicks the website's existing #mb
  microphone button while a call is active)
- Tray menu to open the app, mute/unmute, check updates, or exit
- Microphone/media permission support
- External HTTPS links open in the default browser
- Installer configuration for a Windows x64 NSIS setup

Build on Windows
----------------
1. Install Node.js LTS from https://nodejs.org/
2. Extract this folder.
3. Open Command Prompt in this folder.
4. Run:
      npm install
      npm start
5. To create the Windows installer:
      npm run dist
6. The installer will be in:
      dist/

Important setup notes
---------------------
1. The current app points to https://mazharvoice.kesug.com/. Keep this URL
   unchanged if this is your production website.
2. The starter includes a basic tray PNG. A branded Windows .ico can be added
   later for a polished installer icon; it is not required for this first build.
3. Automatic update checking is only a foundation in this starter. It will
   not deliver updates until a real release provider/repository and published
   release artifacts are configured in package.json. Do not distribute this
   as an auto-updating public release yet.
4. Start-with-Windows is enabled by default in this starter. This first version
   does not yet include an in-app toggle for that setting.
5. The mute shortcut depends on the existing website microphone button id
   "#mb". If the website changes that ID, update main.js.
6. Desktop notifications from the website depend on the website requesting
   Notification permission and generating notifications. Native app
   notification permission may also depend on Windows notification settings.

Storage and hosting limits
--------------------------
This app uses the same server-side storage as the website. It does NOT make
InfinityFree storage unlimited. Free hosting providers impose storage,
bandwidth, file-count, CPU, and account limits. If the service reaches those
limits, the app and website can both be affected. The desktop app itself does
not store an unlimited copy of server data on the PC.

Security
--------
Node integration is disabled, context isolation is enabled, and the website
does not receive direct access to Node.js APIs. Only HTTPS links are used for
the hosted service.

Testing
-------
Test login, friends, chat, microphone permissions, one-to-one calls, group
calls, tray behavior, Windows notifications and mute shortcut on the target
Windows PC before distributing the installer.
