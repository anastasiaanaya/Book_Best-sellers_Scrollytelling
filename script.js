/* ============================================
   BESTSELLERS SCROLLYTELLING — script.js
   Charts: D3.js + SVG pure
   Animations: Intersection Observer
   ============================================ */

/*
  Overview:
  - This script builds all D3-driven charts and interactive UI elements for the scrollytelling.
  - Charts are drawn lazily: each section's chart is created when the section enters view.
  - Many helper functions below handle tooltips, small DOM widgets (book stack), and
    scroll-driven interactions (e.g., the explosion area chart highlighting).
  - DATA at the top is placeholder/simulated data used for visual development — replace
    with real dataset loading logic when ready.
*/

// ---- PLACEHOLDER DATA (replace with real figures) ----
const DATA = {

  // Section 2 — Scale: entries per decade
  scale: [
    { decade: '1930s', entries: 820 },
    { decade: '1940s', entries: 1050 },
    { decade: '1950s', entries: 1340 },
    { decade: '1960s', entries: 1680 },
    { decade: '1970s', entries: 2100 },
    { decade: '1980s', entries: 2450 },
    { decade: '1990s', entries: 2800 },
    { decade: '2000s', entries: 3200 },
    { decade: '2010s', entries: 3650 },
    { decade: '2020s', entries: 1900 },
  ],

  // Section 3 — Origins: 1930s gender split (donut)
  origins: [
    { label: 'Male authors',   value: 73, color: 'var(--male)' },
    { label: 'Female authors', value: 22, color: 'var(--female)' },
    { label: 'Unknown/Group',  value:  5, color: '#bca98a' },
  ],

  // Section 4 — War genres: horizontal bar
  warGenres: [
    { genre: 'Military history',    pct: 28 },
    { genre: 'Political biography', pct: 22 },
    { genre: 'Literary fiction',    pct: 18 },
    { genre: 'War narrative',       pct: 16 },
    { genre: 'Historical novel',    pct: 10 },
    { genre: 'Other',               pct:  6 },
  ],

  // Section 5 — Pioneers: lollipop
  pioneers: [
    { name: 'Pearl S. Buck',       weeks: 52 },
    { name: 'Margaret Mitchell',   weeks: 21 },
    { name: 'F.P. Keyes',          weeks: 14 },
    { name: 'Edna Ferber',         weeks: 11 },
    { name: 'Daphne du Maurier',   weeks:  8 },
  ],

  // Section 6 — Explosion: stacked area by year
  explosion: (() => {
    const years = d3.range(1931, 2025);
    return years.map(y => {
      // Simulated trend: male dominates early, female rises from ~1970
      const t = (y - 1931) / (2024 - 1931);
      const sigmoid = 1 / (1 + Math.exp(-12 * (t - 0.48)));
      const female = Math.min(0.78, Math.max(0.12, sigmoid * 0.72 + 0.1 + (Math.random() - 0.5) * 0.05));
      const male   = 1 - female;
      return { year: y, male: +(male * 100).toFixed(1), female: +(female * 100).toFixed(1) };
    });
  })(),

  // Section 7 — Queens: horizontal ranked bar (with rich tooltip data)
  queens: [
    { name: 'Danielle Steel',     weeks: 381, book: 'Secrets (1985)',            decade: 'Dominated 1980s–2000s', color: '#c9a84c' },
    { name: 'Nora Roberts',       weeks: 342, book: 'The Witness (2012)',         decade: 'Reigned 1990s–2020s',   color: '#b87aaa' },
    { name: 'Janet Evanovich',    weeks: 187, book: 'One for the Money (1994)',   decade: 'Peak 1990s–2010s',      color: '#a06898' },
    { name: 'Sandra Brown',       weeks: 156, book: 'Mirror Image (1990)',        decade: 'Thriller queen, 1990s', color: '#905886' },
    { name: 'Mary Higgins Clark', weeks: 134, book: 'Where Are the Children? (1975)', decade: 'Pioneer of suspense', color: '#804874' },
    { name: 'Jodi Picoult',       weeks: 118, book: 'My Sister\'s Keeper (2004)', decade: 'Literary drama, 2000s', color: '#703862' },
    { name: 'Lisa Scottoline',    weeks:  94, book: 'Everywhere That Mary Went (1993)', decade: 'Legal thriller icon', color: '#602850' },
    { name: 'Sophie Kinsella',    weeks:  82, book: 'Confessions of a Shopaholic (2001)', decade: 'Rom-com revolution', color: '#501840' },
  ],

  // Section 8 — Genres by decade: grouped bar (ALL view)
  genres: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'Literary fiction', color: '#7a5c3a', values: [42, 35, 28, 22, 18, 15] },
      { label: 'Historical novel', color: '#4a6fa5', values: [30, 28, 20, 15, 12, 10] },
      { label: 'Thriller/Mystery', color: '#8b3a2a', values: [ 8, 14, 22, 28, 25, 22] },
      { label: 'Romance',          color: '#8b4a7a', values: [ 5,  8, 18, 25, 28, 30] },
      { label: 'Non-fiction',      color: '#c9a84c', values: [15, 15, 12, 10, 17, 23] },
    ],
  },

  // Section 8 — Fiction Only view
  genresFiction: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'Literary fiction', color: '#7a5c3a', values: [50, 42, 33, 27, 22, 19] },
      { label: 'Historical novel', color: '#4a6fa5', values: [35, 33, 24, 18, 15, 12] },
      { label: 'Thriller/Mystery', color: '#8b3a2a', values: [10, 17, 27, 35, 32, 28] },
      { label: 'Romance',          color: '#8b4a7a', values: [ 5, 8,  16, 20, 31, 41] },
    ],
  },

  // Section 8 — Prize Impact view (% of each genre that won a major prize)
  genresPrizes: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'Literary fiction', color: '#7a5c3a', values: [22, 18, 14, 12, 10,  8] },
      { label: 'Historical novel', color: '#4a6fa5', values: [12, 10,  8,  6,  5,  4] },
      { label: 'Thriller/Mystery', color: '#8b3a2a', values: [ 3,  4,  5,  4,  3,  2] },
      { label: 'Romance',          color: '#8b4a7a', values: [ 1,  1,  2,  2,  2,  2] },
      { label: 'Non-fiction',      color: '#c9a84c', values: [18, 15, 12, 10,  8,  7] },
    ],
  },

  // Section 9 — Today: donut (fiction 2020–2024)
  today: [
    { label: 'Female authors', value: 62, color: 'var(--female)' },
    { label: 'Male authors',   value: 35, color: 'var(--male)' },
    { label: 'Non-binary/Other', value: 3, color: '#bca98a' },
  ],

  // Section 10 — Prestige: scatter / grouped bar
  prestige: [
    { category: 'Male bestsellers',   pct_prize: 10, total: 11200 },
    { category: 'Female bestsellers', pct_prize:  6, total:  9100 },
    { category: 'Male Pulitzer winners',   pct_best: 38, total: 65 },
    { category: 'Female Pulitzer winners', pct_best: 28, total: 42 },
  ],
};

// ---- TOOLTIP ----
// Lightweight page-level tooltip used by many charts.
// - `showTooltip(e, html)` sets content and positions the tooltip near the mouse.
// - `moveTooltip(e)` repositions it on global mousemove events while visible.
// - `hideTooltip()` hides the tooltip.
const tooltip = document.createElement('div');
tooltip.className = 'd3-tooltip';
document.body.appendChild(tooltip);

function showTooltip(e, html) {
  tooltip.innerHTML = html;
  tooltip.style.opacity = '1';
  moveTooltip(e);
}
function moveTooltip(e) {
  tooltip.style.left = (e.clientX + 14) + 'px';
  tooltip.style.top  = (e.clientY - 28) + 'px';
}
function hideTooltip() { tooltip.style.opacity = '0'; }

// ---- COLOUR HELPERS ----
// Centralised color palette used across charts for consistent styling.
// These map semantic names (male/female/gold) to hexadecimal color values.
const C = {
  male:   '#4a6fa5',
  female: '#8b4a7a',
  gold:   '#c9a84c',
  rust:   '#8b3a2a',
  sepia:  '#7a5c3a',
};

// ============================================================
// CHART BUILDERS
// ============================================================

/*
  CHART_MAP: maps section ids to the function that draws that section's chart.
  The `sectionObserver` (below) calls the mapped function after a short delay
  when a section becomes visible, which avoids drawing everything at once.
*/

// ---- SECTION 2: Growing Bar Chart (scale) ----
function drawScale() {
  const el = document.getElementById('chart-scale');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 600, H = 280;
  const margin = { top: 20, right: 20, bottom: 40, left: 55 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg')
    .attr('width', W).attr('height', H)
    .style('overflow', 'visible');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(DATA.scale.map(d => d.decade)).range([0, w]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 4000]).nice().range([h, 0]);

  // Grid lines
  g.selectAll('.grid-line').data(y.ticks(5)).enter().append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', 'rgba(120,90,60,0.12)').attr('stroke-dasharray', '3,3');

  // Bars
  g.selectAll('.bar').data(DATA.scale).enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.decade))
    .attr('width', x.bandwidth())
    .attr('y', h).attr('height', 0)
    .attr('fill', C.rust)
    .attr('rx', 3)
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.decade}</strong><br/>${d.entries.toLocaleString()} entries`))
    .on('mouseleave', hideTooltip)
    .transition().duration(800).delay((d, i) => i * 80)
    .attr('y', d => y(d.entries))
    .attr('height', d => h - y(d.entries));

  // Axes
  g.append('g').attr('class', 'd3-axis').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove();
  g.append('g').attr('class', 'd3-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? d/1000 + 'k' : d)).select('.domain').remove();

  // Y label
  g.append('text').attr('transform', 'rotate(-90)').attr('y', -45).attr('x', -h/2)
    .attr('text-anchor', 'middle').attr('fill', C.sepia)
    .style('font-family', 'Lora, serif').style('font-size', '11px').style('font-style', 'italic')
    .text('Total entries');
}

// ---- SECTION 3: Donut (origins) ----
function drawDonut(containerId, data, title) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const size = Math.min(el.clientWidth || 320, 320);
  const radius = size / 2 - 20;

  const svg = d3.select(el).append('svg')
    .attr('width', size).attr('height', size)
    .style('display', 'block').style('margin', '0 auto');

  const g = svg.append('g').attr('transform', `translate(${size/2},${size/2})`);

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 8);

  const arcs = g.selectAll('path').data(pie(data)).enter().append('path')
    .attr('fill', d => d.data.color)
    .attr('stroke', 'rgba(255,255,255,0.6)').attr('stroke-width', 2)
    .attr('d', arc)
    .style('cursor', 'pointer')
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.data.label}</strong><br/>${d.data.value}%`))
    .on('mouseleave', (e, d) => { d3.select(e.currentTarget).attr('d', arc); hideTooltip(); })
    .on('mouseenter', (e, d) => d3.select(e.currentTarget).transition().duration(200).attr('d', arcHover));

  // Animate
  arcs.attr('d', d => { const s = {...d, endAngle: d.startAngle}; return arc(s); })
    .transition().duration(900).delay((d,i) => i * 200)
    .attrTween('d', function(d) {
      const i = d3.interpolate(d.startAngle + 0.001, d.endAngle);
      return t => { const dd = {...d, endAngle: i(t)}; return arc(dd); };
    });

  // Center label
  g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
    .style('font-family', 'Playfair Display, serif').style('font-size', '2rem').style('font-weight', '900')
    .style('fill', C.rust).text(data[0].value + '%');
  g.append('text').attr('text-anchor', 'middle').attr('dy', '1.4em')
    .style('font-family', 'Lora, serif').style('font-size', '0.7rem').style('font-style', 'italic')
    .style('fill', C.sepia).text('male, 1930s');

  // Legend
  const legend = svg.append('g').attr('transform', `translate(${size/2 - 80}, ${size - 30})`);
  data.forEach((d, i) => {
    const lg = legend.append('g').attr('transform', `translate(${i * 110}, 0)`);
    lg.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', d.color);
    lg.append('text').attr('x', 14).attr('y', 9)
      .style('font-family', 'Lora, serif').style('font-size', '9px').style('fill', C.sepia)
      .text(d.label.split(' ')[0]);
  });
}

// ---- SECTION 4: Horizontal bar (war genres) ----
function drawWarGenres() {
  const el = document.getElementById('chart-wargenres');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 600, H = 240;
  const margin = { top: 10, right: 50, bottom: 20, left: 150 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(DATA.warGenres.map(d => d.genre)).range([0, h]).padding(0.3);
  const x = d3.scaleLinear().domain([0, 35]).range([0, w]);

  g.selectAll('.hbar').data(DATA.warGenres).enter().append('rect')
    .attr('y', d => y(d.genre))
    .attr('height', y.bandwidth())
    .attr('x', 0).attr('width', 0)
    .attr('fill', C.sepia).attr('rx', 3)
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.genre}</strong><br/>${d.pct}% of list`))
    .on('mouseleave', hideTooltip)
    .transition().duration(700).delay((d,i) => i*80)
    .attr('width', d => x(d.pct));

  g.selectAll('.pct-label').data(DATA.warGenres).enter().append('text')
    .attr('y', d => y(d.genre) + y.bandwidth() / 2 + 4)
    .attr('x', d => x(d.pct) + 6)
    .style('font-family', 'Lora, serif').style('font-size', '11px').style('fill', C.sepia)
    .text(d => d.pct + '%');

  g.append('g').attr('class', 'd3-axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
}

// ---- SECTION 5: Lollipop (pioneers) ----
function drawPioneers() {
  const el = document.getElementById('chart-pioneers');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 380, H = 260;
  const margin = { top: 10, right: 30, bottom: 30, left: 150 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(DATA.pioneers.map(d => d.name)).range([0, h]).padding(0.4);
  const x = d3.scaleLinear().domain([0, 60]).range([0, w]);

  // Lines
  g.selectAll('.lollipop-line').data(DATA.pioneers).enter().append('line')
    .attr('y1', d => y(d.name) + y.bandwidth()/2)
    .attr('y2', d => y(d.name) + y.bandwidth()/2)
    .attr('x1', 0).attr('x2', 0)
    .attr('stroke', 'rgba(139,74,122,0.35)').attr('stroke-width', 2)
    .transition().duration(700).delay((d,i) => i*100)
    .attr('x2', d => x(d.weeks));

  // Circles
  g.selectAll('.lollipop-dot').data(DATA.pioneers).enter().append('circle')
    .attr('cy', d => y(d.name) + y.bandwidth()/2)
    .attr('cx', 0).attr('r', 0)
    .attr('fill', C.female)
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.name}</strong><br/>${d.weeks} weeks at #1`))
    .on('mouseleave', hideTooltip)
    .transition().duration(400).delay((d,i) => i*100 + 600)
    .attr('cx', d => x(d.weeks)).attr('r', 7);

  // Labels
  g.selectAll('.week-label').data(DATA.pioneers).enter().append('text')
    .attr('y', d => y(d.name) + y.bandwidth()/2 + 4)
    .attr('x', d => x(d.weeks) + 12)
    .style('font-family', 'Lora, serif').style('font-size', '10px').style('fill', C.female)
    .text(d => d.weeks + ' wks');

  g.append('g').attr('class', 'd3-axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
}

// ---- SECTION 6: Area chart (explosion) ----
function drawExplosion() {
  const el = document.getElementById('chart-explosion');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 700, H = 340;
  const margin = { top: 20, right: 30, bottom: 40, left: 45 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).style('overflow','visible');
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([1931, 2024]).range([0, w]);
  const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

  const areaM = d3.area().x(d => x(d.year)).y0(d => y(d.female)).y1(d => y(100)).curve(d3.curveBasis);
  const areaF = d3.area().x(d => x(d.year)).y0(h).y1(d => y(d.female)).curve(d3.curveBasis);
  const lineF = d3.line().x(d => x(d.year)).y(d => y(d.female)).curve(d3.curveBasis);

  // Gradient female
  const defs = svg.append('defs');
  const gradF = defs.append('linearGradient').attr('id', 'gradFemale').attr('gradientUnits', 'userSpaceOnUse').attr('x1',0).attr('x2',w).attr('y1',0).attr('y2',0);
  gradF.append('stop').attr('offset','0%').attr('stop-color',C.female).attr('stop-opacity',0.5);
  gradF.append('stop').attr('offset','100%').attr('stop-color',C.female).attr('stop-opacity',0.85);
  const gradM = defs.append('linearGradient').attr('id', 'gradMale').attr('gradientUnits', 'userSpaceOnUse').attr('x1',0).attr('x2',w).attr('y1',0).attr('y2',0);
  gradM.append('stop').attr('offset','0%').attr('stop-color',C.male).attr('stop-opacity',0.7);
  gradM.append('stop').attr('offset','100%').attr('stop-color',C.male).attr('stop-opacity',0.3);

  g.append('path').datum(DATA.explosion).attr('fill','url(#gradMale)').attr('d', areaM);
  g.append('path').datum(DATA.explosion).attr('fill','url(#gradFemale)').attr('d', areaF);

  // Dividing line
  const path = g.append('path').datum(DATA.explosion).attr('fill','none')
    .attr('stroke','rgba(255,255,255,0.8)').attr('stroke-width',2).attr('d', lineF);
  const totalLen = path.node().getTotalLength();
  path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
    .transition().duration(2000).delay(200).attr('stroke-dashoffset', 0);

  // Cross annotation (~1978)
  g.append('line').attr('x1', x(1978)).attr('x2', x(1978)).attr('y1', 0).attr('y2', h)
    .attr('stroke', C.gold).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4');
  g.append('text').attr('x', x(1978) + 6).attr('y', 20)
    .style('font-family', 'Lora, serif').style('font-size', '10px').style('font-style', 'italic')
    .style('fill', C.gold).text('Lines cross ~1978');

  // Labels
  g.append('text').attr('x', x(1940)).attr('y', y(85))
    .style('font-family','Playfair Display, serif').style('font-size','13px').style('font-weight','700')
    .style('fill','rgba(255,255,255,0.85)').text('Male');
  g.append('text').attr('x', x(2000)).attr('y', y(25))
    .style('font-family','Playfair Display, serif').style('font-size','13px').style('font-weight','700')
    .style('fill','rgba(255,255,255,0.9)').text('Female');

  // Axes
  g.append('g').attr('class','d3-axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(10)).select('.domain').remove();
  g.append('g').attr('class','d3-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d => d+'%')).select('.domain').remove();
}

// ---- SECTION 7: Horizontal ranked bar (queens) with RICH TOOLTIPS ----
const queenTooltipEl = (() => {
  const el = document.createElement('div');
  el.className = 'queen-tooltip';
  el.innerHTML = `<div class="queen-tooltip-inner">
    <div class="queen-tooltip-header"><div class="queen-tooltip-name"></div></div>
    <div class="queen-tooltip-body">
      <div class="queen-tooltip-book"></div>
      <div class="queen-tooltip-weeks"></div>
      <div class="queen-tooltip-decade"></div>
    </div>
  </div>`;
  document.body.appendChild(el);
  return el;
})();

function showQueenTooltip(e, d) {
  queenTooltipEl.querySelector('.queen-tooltip-name').textContent = d.name;
  queenTooltipEl.querySelector('.queen-tooltip-book').textContent = d.book;
  queenTooltipEl.querySelector('.queen-tooltip-weeks').innerHTML =
    `${d.weeks}<span>weeks at #1</span>`;
  queenTooltipEl.querySelector('.queen-tooltip-decade').textContent = d.decade;
  queenTooltipEl.querySelector('.queen-tooltip-header').style.background =
    `linear-gradient(135deg, ${d.color}, #3a1a2a)`;
  positionQueenTooltip(e);
  queenTooltipEl.classList.add('visible');
}

function positionQueenTooltip(e) {
  const w = queenTooltipEl.offsetWidth || 220;
  let left = e.clientX + 18;
  if (left + w > window.innerWidth - 20) left = e.clientX - w - 12;
  queenTooltipEl.style.left = left + 'px';
  queenTooltipEl.style.top  = (e.clientY - 40) + 'px';
}

function hideQueenTooltip() { queenTooltipEl.classList.remove('visible'); }

function drawQueens() {
  const el = document.getElementById('chart-queens');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 660, H = 320;
  const margin = { top: 10, right: 70, bottom: 20, left: 175 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const sorted = [...DATA.queens].sort((a,b) => b.weeks - a.weeks);

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(sorted.map(d => d.name)).range([0, h]).padding(0.28);
  const x = d3.scaleLinear().domain([0, 420]).range([0, w]);

  // Bars
  const bars = g.selectAll('.queen-bar').data(sorted).enter().append('rect')
    .attr('class', 'queen-bar')
    .attr('y', d => y(d.name)).attr('height', y.bandwidth())
    .attr('x', 0).attr('width', 0)
    .attr('fill', d => d.color).attr('rx', 3)
    .style('cursor', 'pointer')
    .on('mousemove', (e, d) => { showQueenTooltip(e, d); positionQueenTooltip(e); })
    .on('mouseleave', () => hideQueenTooltip())
    .on('mouseenter', function() {
      d3.select(this).transition().duration(150).attr('height', y.bandwidth() + 4).attr('y', function(d) { return y(d.name) - 2; });
    })
    .on('mouseout', function(e, d) {
      d3.select(this).transition().duration(150).attr('height', y.bandwidth()).attr('y', d => y(d.name));
    });

  bars.transition().duration(700).delay((d,i) => i*80)
    .attr('width', d => x(d.weeks));

  // Week labels
  g.selectAll('.queen-label').data(sorted).enter().append('text')
    .attr('y', d => y(d.name) + y.bandwidth()/2 + 4)
    .attr('x', d => x(d.weeks) + 8)
    .style('font-family','Lora,serif').style('font-size','11px').style('fill', C.sepia)
    .text(d => d.weeks + ' wks')
    .style('opacity', 0)
    .transition().delay((d,i) => i*80 + 400).duration(300)
    .style('opacity', 1);

  // Axis
  const ax = g.append('g').attr('class','d3-axis').call(d3.axisLeft(y).tickSize(0));
  ax.select('.domain').remove();
  ax.selectAll('text').style('font-style','italic').style('font-size','12px').style('cursor','pointer')
    .on('mouseover', function(e, name) {
      const d = sorted.find(q => q.name === name);
      if (d) showQueenTooltip(e, d);
    })
    .on('mousemove', (e, name) => {
      const d = sorted.find(q => q.name === name);
      if (d) positionQueenTooltip(e);
    })
    .on('mouseleave', () => hideQueenTooltip());

  // Tooltip follows mouse
  window.addEventListener('mousemove', e => {
    if (queenTooltipEl.classList.contains('visible')) positionQueenTooltip(e);
  });
}

// ---- SECTION 8: Filterable grouped bar (genres by decade) ----
let genresChartState = { filter: 'all' };

function getGenresData(filter) {
  if (filter === 'fiction')  return DATA.genresFiction;
  if (filter === 'prizes')   return DATA.genresPrizes;
  return DATA.genres;
}

function getGenresCaption(filter) {
  if (filter === 'fiction')  return 'Fiction bestsellers only — genre share by decade (%)';
  if (filter === 'prizes')   return 'Share of each genre that received a major literary prize (%)';
  return 'Genre dominance on the bestseller list by decade (%)';
}

function drawGenres() {
  const el = document.getElementById('chart-genres');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  renderGenresChart('all');

  // Wire up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      genresChartState.filter = f;
      document.getElementById('genres-caption').textContent = getGenresCaption(f);
      updateGenresChart(f);
    });
  });
}

function renderGenresChart(filter) {
  const el = document.getElementById('chart-genres');
  const { decades, series } = getGenresData(filter);
  const W = el.clientWidth || 700, H = 340;
  const margin = { top: 30, right: 30, bottom: 55, left: 45 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).style('overflow','visible').attr('id','genres-svg');
  const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`).attr('id','genres-g');

  const x0 = d3.scaleBand().domain(decades).range([0,w]).padding(0.25);
  const x1 = d3.scaleBand().domain(series.map(s=>s.label)).range([0, x0.bandwidth()]).padding(0.08);
  const y  = d3.scaleLinear().domain([0, 55]).range([h, 0]);

  const decadeG = g.selectAll('.decade-g').data(decades).enter().append('g')
    .attr('class','decade-g').attr('transform', d => `translate(${x0(d)},0)`);

  decadeG.selectAll('rect').data(d => series.map(s => ({ label: s.label, value: s.values[decades.indexOf(d)], color: s.color, decade: d })))
    .enter().append('rect')
    .attr('x', d => x1(d.label)).attr('width', x1.bandwidth())
    .attr('y', h).attr('height', 0)
    .attr('fill', d => d.color).attr('rx', 2)
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.label}</strong><br/>${d.decade}: ${d.value}%`))
    .on('mouseleave', hideTooltip)
    .transition().duration(700).delay((d,i) => i*50)
    .attr('y', d => y(d.value)).attr('height', d => h - y(d.value));

  g.append('g').attr('class','d3-axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x0).tickSize(0)).select('.domain').remove();
  g.append('g').attr('class','d3-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d=>d+'%')).select('.domain').remove();

  // Legend
  const legend = g.append('g').attr('id','genres-legend').attr('transform', `translate(0, ${h+36})`);
  series.forEach((s,i) => {
    const lg = legend.append('g').attr('transform', `translate(${i * 130}, 0)`);
    lg.append('rect').attr('width',10).attr('height',10).attr('rx',2).attr('fill',s.color);
    lg.append('text').attr('x',14).attr('y',9).style('font-family','Lora,serif').style('font-size','9px').style('fill',C.sepia).text(s.label);
  });
}

function updateGenresChart(filter) {
  const el = document.getElementById('chart-genres');
  const old = document.getElementById('genres-svg');
  if (old) old.remove();
  renderGenresChart(filter);
}

// ---- SECTION 6: Area chart (explosion) with scroll-driven highlighting ----
let explosionXScale = null;
let explosionChartW  = 0;
let explosionMarginL = 45;

function drawExplosion() {
  const el = document.getElementById('chart-explosion');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 700, H = 340;
  const margin = { top: 20, right: 30, bottom: 40, left: explosionMarginL };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;
  explosionChartW = w;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).style('overflow','visible').attr('id','explosion-svg');
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([1931, 2024]).range([0, w]);
  const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);
  explosionXScale = x;

  const areaM = d3.area().x(d => x(d.year)).y0(d => y(d.female)).y1(d => y(100)).curve(d3.curveBasis);
  const areaF = d3.area().x(d => x(d.year)).y0(h).y1(d => y(d.female)).curve(d3.curveBasis);
  const lineF  = d3.line().x(d => x(d.year)).y(d => y(d.female)).curve(d3.curveBasis);

  // Gradients
  const defs = svg.append('defs');
  ['Female','Male'].forEach((name, i) => {
    const grad = defs.append('linearGradient').attr('id', `grad${name}`)
      .attr('gradientUnits','userSpaceOnUse').attr('x1',0).attr('x2',w);
    if (name === 'Female') {
      grad.append('stop').attr('offset','0%').attr('stop-color',C.female).attr('stop-opacity',0.5);
      grad.append('stop').attr('offset','100%').attr('stop-color',C.female).attr('stop-opacity',0.85);
    } else {
      grad.append('stop').attr('offset','0%').attr('stop-color',C.male).attr('stop-opacity',0.7);
      grad.append('stop').attr('offset','100%').attr('stop-color',C.male).attr('stop-opacity',0.3);
    }
  });

  // Dim overlay (covers the whole chart, sits on top, controlled per step)
  g.append('rect').attr('id','explosion-dim-left')
    .attr('x', 0).attr('y', 0).attr('width', 0).attr('height', h)
    .attr('fill', 'rgba(240,232,216,0.72)').attr('pointer-events','none');
  g.append('rect').attr('id','explosion-dim-right')
    .attr('x', w).attr('y', 0).attr('width', 0).attr('height', h)
    .attr('fill', 'rgba(240,232,216,0.72)').attr('pointer-events','none');

  g.append('path').datum(DATA.explosion).attr('fill','url(#gradMale)').attr('d', areaM).attr('id','area-male');
  g.append('path').datum(DATA.explosion).attr('fill','url(#gradFemale)').attr('d', areaF).attr('id','area-female');

  // Animated dividing line
  const path = g.append('path').datum(DATA.explosion).attr('fill','none')
    .attr('stroke','rgba(255,255,255,0.85)').attr('stroke-width',2.5).attr('d', lineF);
  const totalLen = path.node().getTotalLength();
  path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
    .transition().duration(2000).delay(200).attr('stroke-dashoffset', 0);

  // Highlight band (gold vertical band for active period)
  g.append('rect').attr('id','explosion-highlight-band')
    .attr('x', 0).attr('y', 0).attr('width', 0).attr('height', h)
    .attr('fill', 'rgba(201,168,76,0.12)').attr('stroke', C.gold).attr('stroke-width', 1.5)
    .attr('stroke-dasharray','4,3').attr('pointer-events','none').attr('rx', 2)
    .style('transition','all 0.5s ease');

  // Cross annotation
  g.append('line').attr('x1', x(1978)).attr('x2', x(1978)).attr('y1', 0).attr('y2', h)
    .attr('stroke', C.gold).attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
  g.append('text').attr('x', x(1978) + 6).attr('y', 18)
    .style('font-family','Lora,serif').style('font-size','10px').style('font-style','italic')
    .style('fill', C.gold).text('Lines cross ~1978');

  // Area labels
  g.append('text').attr('x', x(1940)).attr('y', y(85)).attr('id','label-male')
    .style('font-family','Playfair Display,serif').style('font-size','13px').style('font-weight','700')
    .style('fill','rgba(255,255,255,0.85)').text('Male');
  g.append('text').attr('x', x(2000)).attr('y', y(25)).attr('id','label-female')
    .style('font-family','Playfair Display,serif').style('font-size','13px').style('font-weight','700')
    .style('fill','rgba(255,255,255,0.9)').text('Female');

  // Axes
  g.append('g').attr('class','d3-axis').attr('transform',`translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(10)).select('.domain').remove();
  g.append('g').attr('class','d3-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d+'%')).select('.domain').remove();

  // Set up scroll-step observer for explosion
  setupExplosionScrollSteps();
}

function highlightExplosionPeriod(yearStart, yearEnd) {
  if (!explosionXScale) return;
  const svg = document.getElementById('explosion-svg');
  if (!svg) return;

  const x1 = explosionXScale(yearStart);
  const x2 = explosionXScale(yearEnd);

  // Dim left of range
  d3.select('#explosion-dim-left').transition().duration(500)
    .attr('width', Math.max(0, x1));

  // Dim right of range
  d3.select('#explosion-dim-right').transition().duration(500)
    .attr('x', x2).attr('width', Math.max(0, explosionChartW - x2));

  // Gold highlight band
  d3.select('#explosion-highlight-band').transition().duration(500)
    .attr('x', x1).attr('width', x2 - x1);
}

function clearExplosionHighlight() {
  d3.select('#explosion-dim-left').transition().duration(500).attr('width', 0);
  d3.select('#explosion-dim-right').transition().duration(500).attr('x', explosionChartW).attr('width', 0);
  d3.select('#explosion-highlight-band').transition().duration(500).attr('width', 0);
}

function setupExplosionScrollSteps() {
  const steps = document.querySelectorAll('#section-6 .scroll-step');
  if (!steps.length) return;

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const step = entry.target;

      // Mark active step
      steps.forEach(s => s.classList.remove('active-step'));
      step.classList.add('active-step');

      const ys = parseInt(step.dataset.yearStart);
      const ye = parseInt(step.dataset.yearEnd);
      if (ys && ye) {
        highlightExplosionPeriod(ys, ye);
      } else {
        clearExplosionHighlight();
      }
    });
  }, { threshold: 0.55, rootMargin: '-10% 0px -30% 0px' });

  steps.forEach(s => stepObserver.observe(s));
}

// ---- SECTION 9: Donut today ----
// reuses drawDonut with different center label
function drawToday() {
  const el = document.getElementById('chart-today');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const size = Math.min(el.clientWidth || 320, 320);
  const radius = size / 2 - 20;

  const svg = d3.select(el).append('svg').attr('width', size).attr('height', size)
    .style('display','block').style('margin','0 auto');
  const g = svg.append('g').attr('transform', `translate(${size/2},${size/2})`);

  const pie = d3.pie().value(d=>d.value).sort(null);
  const arc = d3.arc().innerRadius(radius*0.55).outerRadius(radius);
  const arcH = d3.arc().innerRadius(radius*0.55).outerRadius(radius+8);

  const arcs = g.selectAll('path').data(pie(DATA.today)).enter().append('path')
    .attr('fill', d => d.data.color)
    .attr('stroke','rgba(255,255,255,0.5)').attr('stroke-width',2)
    .attr('d', arc)
    .on('mousemove', (e,d) => showTooltip(e, `<strong>${d.data.label}</strong><br/>${d.data.value}%`))
    .on('mouseleave', (e,d) => { d3.select(e.currentTarget).attr('d',arc); hideTooltip(); })
    .on('mouseenter', (e) => d3.select(e.currentTarget).transition().duration(200).attr('d',arcH));

  arcs.attr('d', d => { const s={...d,endAngle:d.startAngle}; return arc(s); })
    .transition().duration(900).delay((d,i)=>i*200)
    .attrTween('d', function(d) {
      const interp = d3.interpolate(d.startAngle+0.001, d.endAngle);
      return t => { const dd={...d,endAngle:interp(t)}; return arc(dd); };
    });

  g.append('text').attr('text-anchor','middle').attr('dy','-0.2em')
    .style('font-family','Playfair Display,serif').style('font-size','2rem').style('font-weight','900')
    .style('fill','#8b4a7a').text('62%');
  g.append('text').attr('text-anchor','middle').attr('dy','1.4em')
    .style('font-family','Lora,serif').style('font-size','0.7rem').style('font-style','italic')
    .style('fill',C.sepia).text('female, 2020–24');

  const legend = svg.append('g').attr('transform',`translate(${size/2 - 95}, ${size-28})`);
  DATA.today.forEach((d,i) => {
    const lg = legend.append('g').attr('transform',`translate(${i*100},0)`);
    lg.append('rect').attr('width',10).attr('height',10).attr('rx',2).attr('fill',d.color);
    lg.append('text').attr('x',14).attr('y',9).style('font-family','Lora,serif').style('font-size','9px').style('fill',C.sepia).text(d.label.split(' ')[0]);
  });
}

// ---- SECTION 10: Prestige grouped bar ----
function drawPrestige() {
  const el = document.getElementById('chart-prestige');
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  const W = el.clientWidth || 600, H = 280;
  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const data = [
    { label: 'Male bestsellers\nwith major prize', pct: 10, color: C.male },
    { label: 'Female bestsellers\nwith major prize', pct:  6, color: C.female },
    { label: 'Male Pulitzer\non list', pct: 38, color: C.male, opacity: 0.5 },
    { label: 'Female Pulitzer\non list', pct: 28, color: C.female, opacity: 0.5 },
  ];

  const svg = d3.select(el).append('svg').attr('width',W).attr('height',H).style('overflow','visible');
  const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d=>d.label)).range([0,w]).padding(0.3);
  const y = d3.scaleLinear().domain([0,50]).nice().range([h,0]);

  g.selectAll('.p-bar').data(data).enter().append('rect')
    .attr('x', d => x(d.label)).attr('width', x.bandwidth())
    .attr('y', h).attr('height', 0)
    .attr('fill', d => d.color).attr('opacity', d => d.opacity || 1).attr('rx', 3)
    .on('mousemove', (e,d) => showTooltip(e, `<strong>${d.label.replace('\n',' ')}</strong><br/>${d.pct}%`))
    .on('mouseleave', hideTooltip)
    .transition().duration(700).delay((d,i)=>i*100)
    .attr('y', d => y(d.pct)).attr('height', d => h - y(d.pct));

  g.selectAll('.p-label').data(data).enter().append('text')
    .attr('x', d => x(d.label) + x.bandwidth()/2)
    .attr('y', d => y(d.pct) - 6)
    .attr('text-anchor','middle')
    .style('font-family','Playfair Display,serif').style('font-size','13px').style('font-weight','700')
    .style('fill', '#e8c97a').text(d => d.pct + '%');

  // Axis only bottom, custom tick labels
  const xAxis = g.append('g').attr('class','d3-axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).tickSize(0));
  xAxis.select('.domain').remove();
  xAxis.selectAll('text')
    .style('font-size','9px').style('font-style','italic')
    .attr('dy','1.2em').text(d => d.split('\n')[0]);

  g.append('g').attr('class','d3-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d=>d+'%')).select('.domain').remove();
}

// ============================================================
// BOOK STACK (Section 1, CSS/SVG pure)
// ============================================================
function buildBookStack() {
  const stack = document.getElementById('bookStack');
  if (!stack) return;

  const books = [
    { color:'#c4624a', title:'Gone Girl', w:150, h:210, r:-8,  l:30,  b:0 },
    { color:'#4a6fa5', title:'The Road',  w:145, h:205, r: 4,  l:20,  b:18 },
    { color:'#8b4a7a', title:'Big Magic', w:155, h:215, r:-3,  l:35,  b:36 },
    { color:'#7a5c3a', title:'Pachinko',  w:148, h:208, r: 7,  l:18,  b:52 },
    { color:'#c9a84c', title:'Beloved',   w:152, h:218, r:-5,  l:28,  b:68 },
  ];

  books.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'book';
    div.style.cssText = `
      width:${b.w}px; height:${b.h}px;
      background: linear-gradient(135deg, ${b.color}cc, ${b.color});
      bottom:${b.b}px; left:${b.l}px;
      transform: rotate(${b.r}deg);
      transition: transform 0.4s ease ${i*0.07}s;
      cursor: default;
    `;
    div.innerHTML = `<span style="
      display:block; padding:1rem 0.75rem;
      font-family:'Playfair Display',serif; font-size:0.7rem; font-style:italic;
      color:rgba(255,255,255,0.85); line-height:1.3; writing-mode:horizontal-tb;
    ">${b.title}</span>`;
    div.addEventListener('mouseenter', () => { div.style.transform = `rotate(${b.r}deg) translateY(-8px)`; });
    div.addEventListener('mouseleave', () => { div.style.transform = `rotate(${b.r}deg)`; });
    stack.appendChild(div);
  });
}

// ============================================================
// INTERSECTION OBSERVER — reveal + chart trigger
// ============================================================
const CHART_MAP = {
  'section-2':  () => drawScale(),
  'section-3':  () => drawDonut('chart-origins', DATA.origins, 'origins'),
  'section-4':  () => drawWarGenres(),
  'section-5':  () => drawPioneers(),
  'section-6':  () => drawExplosion(),
  'section-7':  () => drawQueens(),
  'section-8':  () => drawGenres(),
  'section-9':  () => drawToday(),
  'section-10': () => drawPrestige(),
};

/*
  revealObserver: small animation observer that adds `.visible` to elements
  (elements with classes like `reveal-up`) so CSS transitions reveal them.

  sectionObserver: watches full section elements and triggers chart drawing
  and nav-dot updates when a chapter enters view.
*/
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;

      // Draw chart if mapped
      if (CHART_MAP[id]) {
        setTimeout(CHART_MAP[id], 350);
      }

      // Update nav dots
      document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
      const active = document.querySelector(`.nav-dot[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });

// ============================================================
// PROGRESS BAR
// ============================================================
// `updateProgress` updates the thin progress bar at the top of the page
// based on scroll position. It's bound to the window `scroll` event.
function updateProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const scrollTop = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (scrollTop / docH * 100) + '%';
}

// ============================================================
// INIT
// ============================================================
// Initialization: builds the decorative book stack and wires up all observers,
// navigation, and global tooltip behavior. Runs on `DOMContentLoaded`.
document.addEventListener('DOMContentLoaded', () => {
  buildBookStack();

  // Observe all reveal elements
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  // Observe all sections
  document.querySelectorAll('.chapter').forEach(section => {
    sectionObserver.observe(section);
  });

  // Progress bar
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Smooth nav dot clicks
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(dot.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Tooltip follows mouse globally
  window.addEventListener('mousemove', e => {
    if (tooltip.style.opacity === '1') moveTooltip(e);
  });
});
