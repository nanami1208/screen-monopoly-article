const charts = [
  {
    question: "특정 영화가 지나치게 많은 상영관을 차지한다고 느낀 적이 있습니까?",
    center: "84.5%",
    centerText: "있다",
    values: [
      { label: "매우 자주 있다", count: 17, color: "#3367d6" },
      { label: "자주 있다", count: 27, color: "#dc3912" },
      { label: "가끔 있다", count: 16, color: "#ff9900" },
      { label: "거의 없다", count: 10, color: "#109618" },
      { label: "전혀 없다", count: 1, color: "#990099" }
    ]
  },
  {
    question: "스크린 독과점이라는 용어를 들어본 적이 있습니까?",
    center: "77.5%",
    centerText: "인지",
    values: [
      { label: "잘 알고 있다", count: 23, color: "#3367d6" },
      { label: "들어본 적은 있다", count: 32, color: "#dc3912" },
      { label: "처음 들어본다", count: 16, color: "#ff9900" }
    ]
  },
  {
    question: "영화 다양성 확대를 위해 스크린 점유율 규제가 필요하다고 생각하십니까?",
    center: "56.3%",
    centerText: "동의",
    values: [
      { label: "매우 그렇다", count: 11, color: "#3367d6" },
      { label: "그렇다", count: 29, color: "#dc3912" },
      { label: "보통이다", count: 19, color: "#ff9900" },
      { label: "아니다", count: 7, color: "#109618" },
      { label: "전혀 아니다", count: 5, color: "#990099" }
    ]
  }
];

const chartList = document.querySelector("#chart-list");
const tooltip = document.querySelector("#tooltip");
const questionTabs = [...document.querySelectorAll(".question-tab")];

function percent(count, total) {
  return count / total * 100;
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function arcPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    "L", innerStart.x, innerStart.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
    "Z"
  ].join(" ");
}

function showTooltip(event, item, total) {
  tooltip.innerHTML = `<strong>${item.label}</strong><br>${item.count}명 · ${formatPercent(percent(item.count, total))}`;
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
  tooltip.classList.add("visible");
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTooltip() {
  tooltip.classList.remove("visible");
  tooltip.setAttribute("aria-hidden", "true");
}

function showQuestion(targetId) {
  hideTooltip();

  questionTabs.forEach((tab) => {
    const selected = tab.dataset.target === targetId;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  document.querySelectorAll(".question-card").forEach((card) => {
    card.hidden = card.id !== targetId;
  });
}

function renderChart(chart, index) {
  const total = chart.values.reduce((sum, item) => sum + item.count, 0);
  const card = document.createElement("section");
  card.className = "question-card";
  card.id = `question-${index}`;
  card.hidden = index !== 0;

  const title = document.createElement("h2");
  title.className = "question-title";
  title.textContent = chart.question;

  const meta = document.createElement("p");
  meta.className = "question-meta";
  meta.textContent = `응답 ${total}명`;

  const row = document.createElement("div");
  row.className = "chart-row";

  const donutWrap = document.createElement("div");
  donutWrap.className = "donut-wrap";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "donut");
  svg.setAttribute("viewBox", "0 0 240 240");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", chart.question);

  let startAngle = 0;
  chart.values.forEach((item) => {
    const endAngle = startAngle + 360 * item.count / total;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "segment");
    path.setAttribute("d", arcPath(120, 120, 98, 58, startAngle, endAngle));
    path.setAttribute("fill", item.color);
    path.addEventListener("mousemove", (event) => showTooltip(event, item, total));
    path.addEventListener("mouseleave", hideTooltip);
    svg.appendChild(path);
    startAngle = endAngle;
  });

  const center = document.createElement("div");
  center.className = "center-label";
  center.innerHTML = `<span class="center-value">${chart.center}</span><span class="center-text">${chart.centerText}</span>`;

  donutWrap.append(svg, center);

  const legend = document.createElement("div");
  legend.className = "legend";
  chart.values.forEach((item) => {
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
      <span class="swatch" style="background:${item.color}"></span>
      <span class="label">${item.label}</span>
      <span class="value">${item.count}명 · ${formatPercent(percent(item.count, total))}</span>
    `;
    legend.appendChild(legendItem);
  });

  row.append(donutWrap, legend);
  card.append(title, meta, row);
  chartList.appendChild(card);
}

charts.forEach(renderChart);

questionTabs.forEach((tab) => {
  tab.addEventListener("click", () => showQuestion(tab.dataset.target));
});
