# LumeOS Standalone & Bootable ISO Build Guide

LumeOS is configured with relative offline bundling (`base: './'` in `vite.config.ts`, statically bundled wallpapers, and built-in offline games) so `npm run build` outputs a self-contained `dist/` directory capable of running completely outside a web browser.

## 1. Build the Standalone OS Bundle
```bash
npm install
npm run build
```
The compiled `dist/index.html` works directly via `file://` without needing a backend or internet connection.

## 2. Run Outside the Browser (Desktop Shell / Electron)
Use the pre-configured kiosk shell in `os-build/electron-main.cjs`:
```bash
npx electron os-build/electron-main.cjs
```
This launches LumeOS fullscreen with WebGL enabled and exposes `window.lumeNative` (`os-build/electron-preload.cjs`) for hardware reboot/shutdown/fullscreen integration.

## 3. Build a Bootable `LumeOS-x86_64.iso` Disc Image
On a Debian/Ubuntu Linux machine (or CI runner / agent environment):
```bash
sudo bash os-build/build-iso.sh
```
This script:
1. Compiles `dist/` (`npm run build`).
2. Bootstraps a minimal Debian Bookworm x86_64 root filesystem with Xorg + Chromium/Electron kiosk + Mesa WebGL + PulseAudio.
3. Installs `/opt/lumeos/dist` and enables `os-build/lumeos-kiosk.service` for instant autologin into LumeOS.
4. Packs `LumeOS-x86_64.iso` via `mksquashfs` and `grub-mkrescue`.

## 4. Test the ISO
- **QEMU:** `qemu-system-x86_64 -m 2048 -cdrom LumeOS-x86_64.iso -enable-kvm`
- **VirtualBox / VMware:** Attach `LumeOS-x86_64.iso` as optical boot media (enable 3D acceleration).
- **Real PC (USB):** Flash `LumeOS-x86_64.iso` onto a USB drive using Rufus, BalenaEtcher, or Ventoy and boot from UEFI/BIOS.
