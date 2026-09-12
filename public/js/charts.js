/* ==========================================================================
   CafeCharts — Minimal dependency-free canvas charts (line/area + donut)
   ========================================================================== */

const CafeCharts = (() => {

  function setupCanvas(canvas) {

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;


    const ctx = canvas.getContext('2d');

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    return {
        ctx,
        width: rect.width,
        height: rect.height
    };

}

  /* ---------------------- Area / Line chart ---------------------- */
  function drawAreaChart(canvas, data, opts = {}) {

    console.log("DRAWING CHART:", data);
    const { ctx, width, height } = setupCanvas(canvas);
    const primary = opts.color || '#F3B300';
    const padding = { top: 16, right: 8, bottom: 28, left: 8 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);
    if (!data.length) return;

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);

const max = maxValue < 10 
    ? 10 
    : maxValue * 1.15;
    const min = 0;
    const stepX = chartW / (data.length - 1 || 1);

    const xFor = (i) => padding.left + i * stepX;
    const yFor = (v) => padding.top + chartH - ((v - min) / (max - min || 1)) * chartH;

    // Grid lines
    ctx.strokeStyle = 'rgba(20,20,15,0.06)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let g = 0; g <= gridLines; g++) {
      const y = padding.top + (chartH / gridLines) * g;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, hexToRgba(primary, 0.28));
    gradient.addColorStop(1, hexToRgba(primary, 0.02));

    ctx.beginPath();
    ctx.moveTo(xFor(0), yFor(data[0].value));
    data.forEach((d, i) => {
      if (i === 0) return;
      const prev = data[i - 1];
      const cpX = (xFor(i - 1) + xFor(i)) / 2;
      ctx.bezierCurveTo(cpX, yFor(prev.value), cpX, yFor(d.value), xFor(i), yFor(d.value));
    });
    ctx.lineTo(xFor(data.length - 1), padding.top + chartH);
    ctx.lineTo(xFor(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(xFor(0), yFor(data[0].value));
    data.forEach((d, i) => {
      if (i === 0) return;
      const prev = data[i - 1];
      const cpX = (xFor(i - 1) + xFor(i)) / 2;
      ctx.bezierCurveTo(cpX, yFor(prev.value), cpX, yFor(d.value), xFor(i), yFor(d.value));
    });
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Points (only show a subset of labels if too many)
    const labelEvery = Math.ceil(data.length / 8);
    ctx.font = '11px Vazirmatn, sans-serif';
    ctx.fillStyle = '#9C978F';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % labelEvery === 0 || i === data.length - 1) {
        ctx.fillText(CafeUtils.toPersianDigits(d.label), xFor(i), height - 8);
      }
    });

    // Last point dot
    const lastX = xFor(data.length - 1);
    const lastY = yFor(data[data.length - 1].value);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = primary;
    ctx.stroke();


    const oldTooltip = canvas.parentElement.querySelector(".chart-tooltip");

if(oldTooltip){
    oldTooltip.remove();
}
    // Interactive tooltip
    attachTooltip(canvas, data, xFor, yFor, padding, chartW);
  }

  function attachTooltip(canvas, data, xFor, yFor, padding, chartW) {
    let tooltip = canvas.parentElement.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      Object.assign(tooltip.style, {
        position: 'absolute', pointerEvents: 'none', background: '#14140F', color: '#fff',
        padding: '6px 10px', borderRadius: '8px', fontSize: '11px', opacity: '0',
        transition: 'opacity 120ms ease', whiteSpace: 'nowrap', transform: 'translate(-50%, -130%)', zIndex: 5
      });
      canvas.parentElement.style.position = 'relative';
      canvas.parentElement.appendChild(tooltip);
    }
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const stepX = chartW / (data.length - 1 || 1);
      let idx = Math.round((x - padding.left) / stepX);
      idx = Math.max(0, Math.min(data.length - 1, idx));
      const d = data[idx];
      tooltip.style.right = `${rect.width - xFor(idx)}px`;
      tooltip.style.top = `${yFor(d.value)}px`;
      tooltip.textContent = `${CafeUtils.toPersianDigits(d.label)}: ${CafeUtils.formatNumber(d.value)} بازدید`;
      tooltip.style.opacity = '1';
    };
    canvas.onmouseleave = () => { tooltip.style.opacity = '0'; };
  }

  function hexToRgba(hex, alpha) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ---------------------- Donut chart ---------------------- */
  function drawDonutChart(canvas, segments) {
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2;
    const radius = Math.min(width, height) / 2 - 6;
    const innerRadius = radius * 0.62;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

    let start = -Math.PI / 2;
    segments.forEach(seg => {
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.arc(cx, cy, innerRadius, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      start += angle;
    });
  }

  return { drawAreaChart, drawDonutChart };
})();
