#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LumeOS Bootable Live ISO Builder (x86_64 Debian + Wayland/Xorg Kiosk Shell)
# Run on a Debian/Ubuntu Linux host with root privileges:
#   sudo bash os-build/build-iso.sh
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/iso-work"
OUT_ISO="${ROOT_DIR}/LumeOS-x86_64.iso"

echo "[1/5] Building LumeOS static production bundle (dist/)..."
cd "${ROOT_DIR}"
npm ci --ignore-scripts
npm run build

echo "[2/5] Checking host ISO build dependencies..."
for pkg in debootstrap xorriso squashfs-tools grub-pc-bin grub-efi-amd64-bin mtools; do
  if ! dpkg -s "${pkg}" >/dev/null 2>&1; then
    echo "Installing missing package: ${pkg}"
    apt-get update && apt-get install -y "${pkg}"
  fi
done

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}/chroot" "${WORK_DIR}/iso/live" "${WORK_DIR}/iso/boot/grub"

echo "[3/5] Bootstrapping minimal Debian Bookworm rootfs..."
debootstrap --arch=amd64 --variant=minbase bookworm "${WORK_DIR}/chroot" http://deb.debian.org/debian/

chroot "${WORK_DIR}/chroot" /bin/bash -c "
  apt-get update &&
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    linux-image-amd64 live-boot systemd-sysv xorg xserver-xorg-video-all \
    openbox chromium mesa-utils pulseaudio dbus-x11 sudo &&
  useradd -m -s /bin/bash lume &&
  echo 'lume:lume' | chpasswd &&
  usermod -aG sudo,video,audio lume &&
  apt-get clean && rm -rf /var/lib/apt/lists/*
"

echo "[4/5] Copying LumeOS build & kiosk autostart into rootfs..."
mkdir -p "${WORK_DIR}/chroot/opt/lumeos"
cp -r "${ROOT_DIR}/dist" "${WORK_DIR}/chroot/opt/lumeos/dist"
cp "${ROOT_DIR}/os-build/electron-main.cjs" "${WORK_DIR}/chroot/opt/lumeos/"
cp "${ROOT_DIR}/os-build/electron-preload.cjs" "${WORK_DIR}/chroot/opt/lumeos/"

cat <<'EOF' > "${WORK_DIR}/chroot/opt/lumeos/launch-kiosk.sh"
#!/usr/bin/env bash
xset s off -dpms
openbox-session &
exec chromium \
  --kiosk \
  --no-first-run \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --enable-webgl \
  --ignore-gpu-blocklist \
  --allow-file-access-from-files \
  "file:///opt/lumeos/dist/index.html"
EOF
chmod +x "${WORK_DIR}/chroot/opt/lumeos/launch-kiosk.sh"

cp "${ROOT_DIR}/os-build/lumeos-kiosk.service" "${WORK_DIR}/chroot/etc/systemd/system/lumeos-kiosk.service"
chroot "${WORK_DIR}/chroot" systemctl enable lumeos-kiosk.service

echo "[5/5] Packing SquashFS & generating bootable ${OUT_ISO}..."
mksquashfs "${WORK_DIR}/chroot" "${WORK_DIR}/iso/live/filesystem.squashfs" -comp xz -e boot
cp "${WORK_DIR}/chroot/boot/vmlinuz-"* "${WORK_DIR}/iso/live/vmlinuz"
cp "${WORK_DIR}/chroot/boot/initrd.img-"* "${WORK_DIR}/iso/live/initrd"

cat <<'EOF' > "${WORK_DIR}/iso/boot/grub/grub.cfg"
set default=0
set timeout=1

menuentry "LumeOS Nebula Live Desktop (x86_64)" {
    linux /live/vmlinuz boot=live quiet splash
    initrd /live/initrd
}
EOF

grub-mkrescue -o "${OUT_ISO}" "${WORK_DIR}/iso"
echo "Done! Bootable ISO created at: ${OUT_ISO}"
echo "Test in QEMU: qemu-system-x86_64 -m 2048 -cdrom ${OUT_ISO} -enable-kvm"
