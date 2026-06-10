const yearlyData = [
  { year: 2020, days: 143 },
  { year: 2021, days: 149 },
  { year: 2022, days: 180 },
  { year: 2023, days: 104 },
  { year: 2024, days: 151 },
  { year: 2025, days: 128 },
  { year: 2026, days: 70 }
];

const movieData = [
  { movie: "왕과 사는 남자", days: 48, peak: "51.8%", period: "2026년 2~4월" },
  { movie: "파묘", days: 34, peak: "43.6%", period: "2024년 2~3월" },
  { movie: "서울의 봄", days: 28, peak: "48.9%", period: "2023년 11~12월" }
];

const marchData = [
  { label: "CR3", value: 65.7, unit: "%", note: "상위 3개 영화 점유율 합계" },
  { label: "왕과 사는 남자", value: 39.6, unit: "%", note: "단일 영화 스크린 점유율" },
  { label: "실질 경쟁 영화", value: 5, unit: "편", note: "상영작 41편 중" }
];

const tooltip = document.querySelector("#tooltip");
const chartTabs = [...document.querySelectorAll(".chart-tab")];
const chartPanels = [...document.querySelectorAll("[data-panel='chart']")];

function showTooltip(event, html) {
  tooltip.innerHTML = html;
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
  tooltip.classList.add("visible");
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTooltip() {
  tooltip.classList.remove("visible");
  tooltip.setAttribute("aria-hidden", "true");
}

function showPanel(targetId) {
  hideTooltip();

  chartTabs.forEach((tab) => {
    const selected = tab.dataset.target === targetId;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  chartPanels.forEach((panel) => {
    const selected = panel.id === targetId;
    panel.hidden = !selected;
    panel.classList.toggle("active", selected);
  });
}

function el(name, attrs = {}, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function scaleLinear(domainMin, domainMax, rangeMin, rangeMax) {
  return (value) => {
    const ratio = (value - domainMin) / (domainMax - domainMin);
    return rangeMin + ratio * (rangeMax - rangeMin);
  };
}

function renderYearChart() {
  const svg = document.querySelector("#year-chart");
  const margin = { top: 22, right: 34, bottom: 58, left: 72 };
  const width = 760 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;
  const x = scaleLinear(2020, 2026, margin.left, margin.left + width);
  const y = scaleLinear(0, 200, margin.top + height, margin.top);

  [0, 50, 100, 150, 200].forEach((tick) => {
    svg.appendChild(el("line", { x1: margin.left, y1: y(tick), x2: margin.left + width, y2: y(tick), class: "grid" }));
    svg.appendChild(el("text", { x: margin.left - 10, y: y(tick) + 4, "text-anchor": "end", class: "tick" }, tick));
  });

  svg.appendChild(el("line", { x1: margin.left, y1: margin.top + height, x2: margin.left + width, y2: margin.top + height, class: "axis" }));
  svg.appendChild(el("line", { x1: margin.left, y1: margin.top, x2: margin.left, y2: margin.top + height, class: "axis" }));

  yearlyData.forEach((d) => {
    svg.appendChild(el("text", { x: x(d.year), y: margin.top + height + 24, "text-anchor": "middle", class: "tick" }, d.year));
  });

  const points = yearlyData.map((d) => [x(d.year), y(d.days)]);
  const areaPath = `M ${points[0][0]} ${margin.top + height} L ${points.map((p) => `${p[0]} ${p[1]}`).join(" L ")} L ${points[points.length - 1][0]} ${margin.top + height} Z`;
  const linePath = `M ${points.map((p) => `${p[0]} ${p[1]}`).join(" L ")}`;
  svg.appendChild(el("path", { d: areaPath, class: "area" }));
  svg.appendChild(el("path", { d: linePath, class: "line" }));

  yearlyData.forEach((d) => {
    const point = el("circle", { cx: x(d.year), cy: y(d.days), r: 5, class: "point" });
    point.addEventListener("mousemove", (event) => showTooltip(event, `<strong>${d.year}년</strong><br>${d.days}일`));
    point.addEventListener("mouseleave", hideTooltip);
    svg.appendChild(point);
  });

  svg.appendChild(el("text", { x: margin.left + width / 2, y: 402, "text-anchor": "middle", class: "axis-label" }, "연도"));
  svg.appendChild(el("text", { x: -210, y: 22, transform: "rotate(-90)", "text-anchor": "middle", class: "axis-label" }, "30% 이상 점유일"));

  svg.appendChild(el("line", { x1: 572, y1: 44, x2: 612, y2: 44, class: "line" }));
  svg.appendChild(el("text", { x: 622, y: 48, class: "legend" }, "30% 이상 점유일"));
}

function renderMovieChart() {
  const svg = document.querySelector("#movie-chart");
  const margin = { top: 28, right: 42, bottom: 44, left: 150 };
  const width = 760 - margin.left - margin.right;
  const barH = 34;
  const gap = 36;
  const max = 50;
  const x = scaleLinear(0, max, margin.left, margin.left + width);

  [0, 10, 20, 30, 40, 50].forEach((tick) => {
    svg.appendChild(el("line", { x1: x(tick), y1: margin.top - 8, x2: x(tick), y2: 260, class: "grid" }));
    svg.appendChild(el("text", { x: x(tick), y: 286, "text-anchor": "middle", class: "tick" }, tick));
  });

  movieData.forEach((d, i) => {
    const y = margin.top + i * (barH + gap);
    svg.appendChild(el("text", { x: margin.left - 12, y: y + 22, "text-anchor": "end", class: "tick" }, d.movie));
    const bar = el("rect", { x: margin.left, y, width: x(d.days) - margin.left, height: barH, class: "bar" });
    bar.addEventListener("mousemove", (event) => showTooltip(event, `<strong>${d.movie}</strong><br>${d.days}일<br>최고 점유율 ${d.peak}<br>${d.period}`));
    bar.addEventListener("mouseleave", hideTooltip);
    svg.appendChild(bar);
    svg.appendChild(el("text", { x: x(d.days) + 8, y: y + 22, class: "value-label" }, `${d.days}일`));
  });

  svg.appendChild(el("text", { x: margin.left + width / 2, y: 330, "text-anchor": "middle", class: "axis-label" }, "30% 이상 점유 지속일"));
}

function renderMarchChart() {
  const svg = document.querySelector("#march-chart");
  const margin = { top: 26, right: 44, bottom: 58, left: 132 };
  const width = 760 - margin.left - margin.right;
  const barH = 34;
  const gap = 42;
  const x = scaleLinear(0, 70, margin.left, margin.left + width);

  [0, 20, 40, 60].forEach((tick) => {
    svg.appendChild(el("line", { x1: x(tick), y1: margin.top - 8, x2: x(tick), y2: 250, class: "grid" }));
    svg.appendChild(el("text", { x: x(tick), y: 284, "text-anchor": "middle", class: "tick" }, tick));
  });

  marchData.forEach((d, i) => {
    const y = margin.top + i * (barH + gap);
    svg.appendChild(el("text", { x: margin.left - 12, y: y + 22, "text-anchor": "end", class: "tick" }, d.label));
    const bar = el("rect", { x: margin.left, y, width: x(d.value) - margin.left, height: barH, class: i === 2 ? "bar alt" : "bar" });
    bar.addEventListener("mousemove", (event) => showTooltip(event, `<strong>${d.label}</strong><br>${d.value}${d.unit}<br>${d.note}`));
    bar.addEventListener("mouseleave", hideTooltip);
    svg.appendChild(bar);
    svg.appendChild(el("text", { x: x(d.value) + 8, y: y + 22, class: "value-label" }, `${d.value}${d.unit}`));
  });

  svg.appendChild(el("line", { x1: x(30), y1: margin.top - 10, x2: x(30), y2: 250, class: "threshold" }));
  svg.appendChild(el("text", { x: x(30) + 6, y: margin.top - 14, class: "threshold-label" }, "30% 기준"));
  svg.appendChild(el("text", { x: margin.left + width / 2, y: 330, "text-anchor": "middle", class: "axis-label" }, "비율 또는 영화 수"));
}

renderYearChart();
renderMovieChart();
renderMarchChart();

chartTabs.forEach((tab) => {
  tab.addEventListener("click", () => showPanel(tab.dataset.target));
});

