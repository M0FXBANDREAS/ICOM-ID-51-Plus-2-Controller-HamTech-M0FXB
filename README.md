



# HamTec ID51 Control — desktop edition

A colourful, offline desktop control desk for the **Icom ID-51A / ID-51E Plus2**. The front panel uses the exact user-supplied radio photograph with transparent clickable hotspots over the pictured controls. The LCD area displays workspace or received radio data.

## 0.2.2 Timeout cleanup fix

Disconnect is now serialized, preventing duplicate close calls after a timeout. Startup polling waits until the initial handshake completes; an older read loop cannot close a later connection. This fixes cleanup errors; it does not resolve a radio/cable sending no bytes.

## 0.2.1 Windows connection fix

Use **Choose COM port…** above the control desk to select the cable. The picker shows the actual COM number before the friendly USB name. The selected port stays visible with baud rate, address and TX/RX byte counters. Connection help explains no-data versus unmatched-reply timeouts. The handshake reads frequency directly and no longer requires an identity reply. Timeout defaults to 3000 ms and can be changed in settings.

## Download and run

Windows x64: extract the **entire** Windows ZIP, then double-click **HamTec ID51 Control.exe**. Keep the executable, `resources`, DLLs and other extracted files together. No Node.js, browser, website or internet connection is needed to run the packaged app. This is a portable application, not a one-file installer.

Linux x64: extract the tar.gz and run the included executable. A supported desktop environment and Electron system libraries are required. Your account needs serial-port access (often the `dialout` group).

macOS: extract the architecture-appropriate ZIP and open the `.app`. Builds are unsigned and not notarized. Choose arm64 for Apple Silicon or x64 for Intel. Sign and notarize your own public releases if desired.

This does **not** run on literally every PC: separate OS/architecture builds are necessary. Older operating systems, ARM Windows, 32-bit Windows, missing cable drivers or restricted device policies may prevent operation. Only Windows x64 and Linux x64 archives were built in this workspace; macOS builds are provided through the included workflow and remain untested.

## Connect the radio

1. Use an **OPC-2350LU** compatible cable in the radio's DATA connector. The user-mentioned OPC2351 model has not been verified. Install the applicable Icom USB driver for your operating system. The program does not bundle a driver.
2. On the radio, select **MENU → Function → CI-V → CI-V (DATA Jack) → ON (Echo Back OFF)**.
3. Set the address to **86h** and the baud rate to **19200** (or select a matching 4800 / 9600 setting in the application).
4. Close other programs using that serial port. Open this app, click **Choose COM port…**, select the cable's COM number, then click **Connect USB**. The chooser updates when cables are added or removed.
5. Wait for **RADIO RESPONDING**. “Port open” alone is not proof of a radio connection. Writes require a positive `FB` acknowledgement. Rejection, timeout and disconnect are reported; timeout closes the connection to prevent a late reply being assigned to a later command.

**Physical radio operation has not been tested.** Unit tests cover protocol encoding, input validation and response parsing; successful packaging is not hardware validation.

## Implemented capabilities

| Feature | Desktop implementation |
| --- | --- |
| Frequency | Read and acknowledged write; BCD CI-V 03 / 05 |
| FM, FM-N, D-STAR DV | Read/write through 04 / 06 |
| VFO and main A/B band | 07; 07 D0 / D1 |
| Single/dual watch | 16 59 |
| CTCSS and tone | Tone mode 16 5D, repeater tone 1B 00, tone squelch 1B 01 |
| Repeater shift and amount | 0F and 0D |
| Signal meter | Polls 15 02; relative raw value, stale-data indicator; no fabricated dBm |
| Audio and squelch levels | 14 01 / 03 |
| MY callsign and note | 1F 00 |
| UR, RPT1 and RPT2 | 1F 01 |
| DV message | 1F 02 |
| GPS on/off | 23 01 |
| GPS position | 23 00 raw payload; decoded map coordinates not implemented |
| Airband shortcut | B-band 118 MHz; select AM on the physical radio because its CI-V AM encoding is not verified |
| Marine RX shortcut | B-band 156.800 MHz / FM; receive only |
| Memory workspace | Local persistent storage and validated JSON import/export; not a radio clone |
| Software scan | Sequential frequency writes and S-meter reads; pauses on configured signal threshold |
| Software scope | Sequential samples; not a native band-scope stream or SDR spectrum |
| Terminal mode | Radio-side instructions and official RS-MS3W/RS-MS3A integration guidance; no gateway network/audio implementation |
| PTT, monitor and power keys | Explicit instructions, not unsupported remote key emulation |

Memory cloning, native scan commands, general menu navigation and arbitrary hardware-key emulation are **not exposed in the documented Plus2 CI-V table**. Use **CS-51PLUS2** for complete cloning/settings and the physical radio for native controls. “Every button is clickable” does not imply every button has a remotely controllable hardware equivalent.

Serial software scan retunes the MAIN receiver. Stopping restores its starting frequency if the connection is still available. The sub receiver frequency shown on-screen is a stored last-known/local value, not simultaneous independent telemetry. Demo mode is visibly marked **SIMULATED** and sends no commands.

## Photo controls

Hover or focus a hotspot for its label. MENU opens settings, MODE cycles FM/FM-N/DV, MAIN switches main band, V/MHz selects VFO, M/CALL opens the local memory workspace, QUICK opens control help, DR opens D-STAR settings, arrows select band/tuning and ENT applies tuning.

**Shift-click MODE** starts software scan; **Shift-click MAIN** selects single/dual watch; **Shift-click the tuning dial** tunes down. The volume knob opens audio/squelch settings. PTT, SQL and power show the supported radio-side instructions.

## Put the source on GitHub

Unzip `HamTec-ID51-Desktop-Source.zip`. Upload the files inside `hamtec-desktop` as the root of your repository, including `.github/workflows/build.yml`, `package.json` and `package-lock.json`. Do not upload `node_modules` or the local `release` directory as source.

On GitHub, open **Actions → Build desktop downloads → Run workflow**. It builds Windows x64, Linux x64, and Intel/Apple Silicon macOS packages. Download the resulting workflow artifacts. The workflow also runs when a tag beginning with `v` is pushed; it does not automatically publish a public GitHub Release.

To attach packages to a release, create a GitHub Release and upload the ZIP/tar.gz files. This project has not been uploaded to your GitHub account by this assistant.

## Develop and build

Install a supported Node.js version (workflow uses Node 22):

```sh
npm ci
npm test
npm start
```

Build on the target operating system:

```sh
npm run dist:win
npm run dist:linux
npm run dist:mac
```

`electron-builder` also supports cross-packaging the unsigned Windows ZIP from Linux. macOS packaging requires macOS. Dependencies and Electron downloads require internet **during development/build**, not during ordinary packaged operation. The lockfile fixes dependency versions. USB drivers remain external.

The renderer has no Node access, uses an isolated sandboxed preload, permits only local scripts/assets, and never loads remote app code. Icom documentation links open in your default browser only when you click them.

## Photo and source licensing

Original application code is provided under MIT; see LICENSE. The **user-supplied photo is excluded from that license**. It visibly bears `www.rigpix.com`; its attribution remains in the unmodified file. Establish permission to redistribute that photo before publishing it on GitHub or distributing it in public binaries. You can replace `ui/assets/id51-reference.jpg` with your own authorized photo of the same dimensions and adjust hotspot coordinates if its framing differs.

This is independent software and is not affiliated with or endorsed by Icom or RigPix. It does not include Icom's cloning software, USB drivers or proprietary manuals.

## Protocol sources

- Icom Plus2 Advanced Manual, chapter 17, pages 17-22–17-28: https://www.icomamerica.com/support/manual/2095/
- Icom cable: https://www.icomamerica.com/lineup/options/OPC-2350LU/
- Icom cloning software: https://www.icomjapan.com/lineup/options/CS-51PLUS2/
- Electron device-access API: https://www.electronjs.org/docs/latest/tutorial/devices
