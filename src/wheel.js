import { WHEEL_ORDER, colorOf } from './games.js';

export function drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const r = size / 2;
  const slice = Math.PI * 2 / 37;
  ctx.clearRect(0, 0, size, size);
  ctx.save(); ctx.translate(r, r);
  ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, Math.PI * 2); ctx.fillStyle = '#c49d60'; ctx.fill();
  WHEEL_ORDER.forEach((number, index) => {
    const start = index * slice - Math.PI / 2 - slice / 2;
    const end = start + slice;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 15, start, end); ctx.closePath();
    ctx.fillStyle = { red: '#a73d3c', black: '#15201e', green: '#377866' }[colorOf(number)]; ctx.fill();
    ctx.strokeStyle = '#d1b17b'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.save(); ctx.rotate(index * slice); ctx.fillStyle = '#fff5de'; ctx.font = '500 26px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(number), 0, -r + 62); ctx.restore();
  });
  ctx.beginPath(); ctx.arc(0, 0, r - 108, 0, Math.PI * 2); ctx.fillStyle = '#24483d'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#c49d60'; ctx.stroke();
  for (let i = 0; i < 37; i++) {
    const angle = i * slice - Math.PI / 2 - slice / 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(angle) * (r - 111), Math.sin(angle) * (r - 111)); ctx.lineTo(Math.cos(angle) * (r - 150), Math.sin(angle) * (r - 150)); ctx.strokeStyle = '#b9965b'; ctx.lineWidth = 2; ctx.stroke();
  }
  const centerGradient = ctx.createRadialGradient(-55, -90, 10, 0, 0, r - 152); centerGradient.addColorStop(0, '#436b54'); centerGradient.addColorStop(1, '#17382e');
  ctx.beginPath(); ctx.arc(0, 0, r - 154, 0, Math.PI * 2); ctx.fillStyle = centerGradient; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#7d7750'; ctx.stroke();
  ctx.restore();
}

export function rotationFor(number, currentRotation) {
  const target = (360 - WHEEL_ORDER.indexOf(number) * 360 / 37) % 360;
  const normalized = ((currentRotation % 360) + 360) % 360;
  return currentRotation + 360 * 5 + (target - normalized + 360) % 360;
}
