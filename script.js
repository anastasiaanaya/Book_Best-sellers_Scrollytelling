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

// ---- REAL DATA from NYT Bestseller Archive (DATAsets.xlsx) ----
const DATA = {
 
  // Section 2 — Scale: total entries per decade (real data)
  scale: [
    { decade: '1930s', entries: 2598 },
    { decade: '1940s', entries: 5209 },
    { decade: '1950s', entries: 8303 },
    { decade: '1960s', entries: 6142 },
    { decade: '1970s', entries: 5630 },
    { decade: '1980s', entries: 7898 },
    { decade: '1990s', entries: 7925 },
    { decade: '2000s', entries: 7956 },
    { decade: '2010s', entries: 7990 },
    { decade: '2020s', entries:  735 },
  ],
 
  // Section 3 — Origins: 1930s gender split (real: F 35.8%, M 64.2%)
  origins: [
    { label: 'Male authors',   value: 64.2, color: 'var(--male)' },
    { label: 'Female authors', value: 35.8, color: 'var(--female)' },
    { label: 'Unknown/Group',  value:  0.0, color: '#bca98a' },
  ],
 
  // Section 4 — War genres: placeholder (genre not in dataset yet)
  warGenres: [
    { genre: 'Military history',    pct: 28 },
    { genre: 'Political biography', pct: 22 },
    { genre: 'Literary fiction',    pct: 18 },
    { genre: 'War narrative',       pct: 16 },
    { genre: 'Historical novel',    pct: 10 },
    { genre: 'Other',               pct:  6 },
  ],
 
  // Section 5 — Pioneers: real data from Top female sheet (list entries)
  pioneers: [
    { name: 'Frances P. Keyes', weeks: 281 },
    { name: 'Pearl S. Buck',    weeks: 236 },
    { name: 'Helen MacInnes',   weeks: 307 },
    { name: 'Daphne Du Maurier',weeks: 317 },
    { name: 'Edna Ferber',      weeks:  94 },
  ],
 
  // Section 6 — Explosion: real yearly % from by_gender sheet
  explosion: [
    { year: 1931, male: 68.0, female: 32.0 },
    { year: 1932, male: 59.0, female: 41.0 },
    { year: 1933, male: 71.2, female: 28.2 },
    { year: 1934, male: 70.1, female: 29.9 },
    { year: 1935, male: 63.0, female: 37.0 },
    { year: 1936, male: 62.3, female: 37.7 },
    { year: 1937, male: 71.0, female: 29.0 },
    { year: 1938, male: 59.0, female: 41.0 },
    { year: 1939, male: 56.7, female: 43.3 },
    { year: 1940, male: 76.3, female: 23.7 },
    { year: 1941, male: 65.7, female: 34.3 },
    { year: 1942, male: 45.4, female: 54.6 },
    { year: 1943, male: 65.0, female: 35.0 },
    { year: 1944, male: 60.2, female: 39.8 },
    { year: 1945, male: 60.6, female: 39.4 },
    { year: 1946, male: 54.8, female: 45.2 },
    { year: 1947, male: 78.5, female: 21.5 },
    { year: 1948, male: 64.9, female: 35.1 },
    { year: 1949, male: 72.3, female: 27.7 },
    { year: 1950, male: 66.1, female: 32.7 },
    { year: 1951, male: 79.0, female: 21.0 },
    { year: 1952, male: 68.4, female: 31.6 },
    { year: 1953, male: 72.3, female: 27.7 },
    { year: 1954, male: 73.2, female: 26.8 },
    { year: 1955, male: 71.5, female: 28.5 },
    { year: 1956, male: 74.3, female: 25.7 },
    { year: 1957, male: 68.1, female: 31.7 },
    { year: 1958, male: 66.4, female: 33.6 },
    { year: 1959, male: 78.9, female: 21.1 },
    { year: 1960, male: 78.3, female: 21.7 },
    { year: 1961, male: 71.6, female: 28.4 },
    { year: 1962, male: 73.0, female: 27.0 },
    { year: 1963, male: 67.0, female: 33.0 },
    { year: 1964, male: 81.7, female: 18.3 },
    { year: 1965, male: 74.2, female: 22.8 },
    { year: 1966, male: 65.0, female: 35.0 },
    { year: 1967, male: 65.5, female: 34.5 },
    { year: 1968, male: 79.2, female: 20.8 },
    { year: 1969, male: 65.6, female: 34.4 },
    { year: 1970, male: 62.9, female: 37.1 },
    { year: 1971, male: 76.9, female: 23.1 },
    { year: 1972, male: 78.5, female: 21.5 },
    { year: 1973, male: 71.0, female: 29.0 },
    { year: 1974, male: 78.3, female: 21.7 },
    { year: 1975, male: 86.5, female: 13.5 },
    { year: 1976, male: 70.4, female: 29.6 },
    { year: 1977, male: 74.8, female: 25.2 },
    { year: 1978, male: 70.2, female: 29.8 },
    { year: 1979, male: 79.9, female: 20.1 },
    { year: 1980, male: 69.6, female: 30.4 },
    { year: 1981, male: 82.8, female: 17.2 },
    { year: 1982, male: 74.9, female: 25.1 },
    { year: 1983, male: 70.5, female: 29.5 },
    { year: 1984, male: 71.1, female: 28.9 },
    { year: 1985, male: 77.3, female: 22.7 },
    { year: 1986, male: 67.5, female: 32.5 },
    { year: 1987, male: 78.4, female: 21.6 },
    { year: 1988, male: 68.9, female: 31.1 },
    { year: 1989, male: 71.6, female: 28.4 },
    { year: 1990, male: 74.7, female: 25.3 },
    { year: 1991, male: 62.5, female: 37.1 },
    { year: 1992, male: 64.3, female: 32.4 },
    { year: 1993, male: 71.0, female: 29.0 },
    { year: 1994, male: 67.8, female: 32.2 },
    { year: 1995, male: 66.2, female: 32.8 },
    { year: 1996, male: 67.5, female: 29.3 },
    { year: 1997, male: 66.1, female: 33.9 },
    { year: 1998, male: 58.7, female: 41.3 },
    { year: 1999, male: 51.2, female: 48.8 },
    { year: 2000, male: 51.4, female: 48.6 },
    { year: 2001, male: 55.6, female: 44.4 },
    { year: 2002, male: 61.6, female: 38.4 },
    { year: 2003, male: 62.4, female: 37.6 },
    { year: 2004, male: 61.5, female: 38.3 },
    { year: 2005, male: 65.6, female: 34.4 },
    { year: 2006, male: 57.0, female: 42.5 },
    { year: 2007, male: 64.3, female: 35.7 },
    { year: 2008, male: 57.7, female: 42.3 },
    { year: 2009, male: 53.4, female: 46.6 },
    { year: 2010, male: 62.0, female: 38.0 },
    { year: 2011, male: 61.3, female: 38.8 },
    { year: 2012, male: 60.4, female: 39.6 },
    { year: 2013, male: 58.8, female: 41.2 },
    { year: 2014, male: 55.7, female: 44.3 },
    { year: 2015, male: 54.6, female: 45.4 },
    { year: 2016, male: 49.3, female: 50.7 },
    { year: 2017, male: 58.0, female: 41.9 },
    { year: 2018, male: 48.0, female: 52.0 },
    { year: 2019, male: 52.9, female: 47.1 },
    { year: 2020, male: 40.3, female: 59.3 },
  ],
 
  // Section 7 — Queens: real data from Top female sheet (total list appearances)
  queens: [
    { name: 'Danielle Steel',          weeks: 957, book: 'Secrets (1985)',                    decade: 'Dominated 1980s–2010s', color: '#c9a84c' },
    { name: 'Taylor Caldwell',         weeks: 524, book: 'Captains and the Kings (1972)',     decade: 'Mid-century giant',     color: '#c09040' },
    { name: 'Mary Higgins Clark',      weeks: 403, book: 'Where Are the Children? (1975)',   decade: 'Queen of suspense',     color: '#b07aaa' },
    { name: 'Daphne Du Maurier',       weeks: 317, book: 'Rebecca (1938)',                   decade: 'Pioneer, 1930s–60s',    color: '#a06898' },
    { name: 'Helen MacInnes',          weeks: 307, book: 'Above Suspicion (1939)',           decade: 'Spy thriller icon',     color: '#905886' },
    { name: 'Mary Stewart',            weeks: 294, book: 'The Crystal Cave (1970)',          decade: 'Romance & mystery',     color: '#804874' },
    { name: 'Frances Parkinson Keyes', weeks: 281, book: "Dinner at Antoine's (1948)",       decade: 'Pioneer, 1930s–50s',    color: '#703862' },
    { name: 'Pearl S. Buck',           weeks: 236, book: 'The Good Earth (1931)',            decade: 'Nobel laureate, 1930s', color: '#602850' },
  ],
 
  // Section 8 — Genres by decade: grouped bar (ALL view — REAL DATA)
  genres: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'General Fiction',    color: '#7a5c3a', values: [86.1, 85.7, 76.2, 66.8, 64.0, 68.0] },
      { label: 'Historical Fiction', color: '#4a6fa5', values: [ 7.2,  6.6, 10.6,  0.9,  1.3,  1.0] },
      { label: 'Thriller/Mystery',   color: '#8b3a2a', values: [ 4.5,  2.1,  7.8, 15.6, 25.6, 21.8] },
      { label: 'Romance',            color: '#8b4a7a', values: [ 1.4,  3.8,  2.7,  8.1,  4.6,  3.8] },
      { label: 'Sci-Fi & Fantasy',   color: '#c9a84c', values: [ 0.6,  1.0,  2.2,  7.9,  3.9,  4.4] },
    ],
  },
 
  // Section 8 — Fiction Only: female authors only (REAL DATA)
  genresFiction: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'General Fiction',    color: '#7a5c3a', values: [78.8, 75.9, 68.9, 63.4, 70.0, 84.9] },
      { label: 'Historical Fiction', color: '#4a6fa5', values: [11.6, 15.4, 11.4,  0.5,  1.4,  0.0] },
      { label: 'Thriller/Mystery',   color: '#8b3a2a', values: [ 5.9,  2.4, 13.6,  8.4, 18.6,  6.0] },
      { label: 'Romance',            color: '#8b4a7a', values: [ 3.8,  3.3,  5.2, 22.0,  8.4,  6.2] },
      { label: 'Sci-Fi & Fantasy',   color: '#c9a84c', values: [ 0.0,  2.4,  0.0,  4.8,  1.1,  1.1] },
    ],
  },
 
  // Section 8 — Prize Impact: estimated % Pulitzer authors per genre
  genresPrizes: {
    decades: ['1930s','1950s','1970s','1990s','2010s','2020s'],
    series: [
      { label: 'General Fiction',    color: '#7a5c3a', values: [18, 15, 12,  9,  7,  5] },
      { label: 'Historical Fiction', color: '#4a6fa5', values: [12,  9,  7,  4,  3,  2] },
      { label: 'Thriller/Mystery',   color: '#8b3a2a', values: [ 4,  3,  4,  3,  2,  2] },
      { label: 'Romance',            color: '#8b4a7a', values: [ 1,  1,  2,  1,  1,  0] },
      { label: 'Sci-Fi & Fantasy',   color: '#c9a84c', values: [ 0,  1,  2,  3,  2,  1] },
    ],
  },
 
  // Section 9 — Today: real data 2016–2020 (overall list)
  today: [
    { label: 'Female authors',   value: 50.1, color: 'var(--female)' },
    { label: 'Male authors',     value: 49.8, color: 'var(--male)' },
    { label: 'Non-binary/Other', value:  0.1, color: '#bca98a' },
  ],
 
  // Section 10 — Prestige: real cross-reference NYT list × Pulitzer Fiction winners
  // Female Pulitzer Fiction winners: 23, of which 21 appeared on NYT list (91%)
  // Male Pulitzer Fiction winners:   30, of which 26 appeared on NYT list (87%)
  // Of all unique female titles on NYT: ~16% authored by Pulitzer-winning authors
  // Of all unique male titles on NYT:   ~15% authored by Pulitzer-winning authors
  prestige: [
    { category: 'Male bestsellers',          pct_prize: 15.4, total: 4444 },
    { category: 'Female bestsellers',        pct_prize: 16.3, total: 2974 },
    { category: 'Male Pulitzer → on list',   pct_prize: 87,   total: 30 },
    { category: 'Female Pulitzer → on list', pct_prize: 91,   total: 23 },
  ],
};
 
// ---- TOOLTIP ----
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
// SVG height = donut area + legend area below it, so nothing overlaps.
function drawDonut(containerId, data, title) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.drawn) return;
  el.dataset.drawn = '1';

  // Filter out zero-value slices to avoid empty legend entries
  const filtered = data.filter(d => d.value > 0);

  const ringSize = Math.min(el.clientWidth || 300, 300);
  const radius   = ringSize / 2 - 22;
  const legendH  = 28;                          // space reserved below ring for legend
  const totalH   = ringSize + legendH;

  const svg = d3.select(el).append('svg')
    .attr('width', ringSize).attr('height', totalH)
    .style('display', 'block').style('margin', '0 auto')
    .style('overflow', 'visible');

  // Ring group — centred in the top ringSize × ringSize area
  const g = svg.append('g').attr('transform', `translate(${ringSize/2},${ringSize/2})`);

  const pie      = d3.pie().value(d => d.value).sort(null);
  const arc      = d3.arc().innerRadius(radius * 0.54).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(radius * 0.54).outerRadius(radius + 9);

  const arcs = g.selectAll('path').data(pie(filtered)).enter().append('path')
    .attr('fill', d => d.data.color)
    .attr('stroke', 'rgba(255,255,255,0.55)').attr('stroke-width', 2)
    .attr('d', arc)
    .style('cursor', 'pointer')
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.data.label}</strong><br/>${d.data.value}%`))
    .on('mouseleave', (e, d) => { d3.select(e.currentTarget).transition().duration(150).attr('d', arc); hideTooltip(); })
    .on('mouseenter', (e, d) => d3.select(e.currentTarget).transition().duration(180).attr('d', arcHover));

  // Animate spin-in
  arcs.attr('d', d => { const s = {...d, endAngle: d.startAngle + 0.001}; return arc(s); })
    .transition().duration(900).delay((d, i) => i * 200)
    .attrTween('d', function(d) {
      const interp = d3.interpolate(d.startAngle + 0.001, d.endAngle);
      return t => arc({...d, endAngle: interp(t)});
    });

  // Center label — two lines
  const centerLabel = filtered[1] ? `${filtered[1].value}%` : `${filtered[0].value}%`;
  const centerSub   = title === 'today' ? 'female, 2016–20' : 'male, 1930s';
  g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.15em')
    .style('font-family', 'Playfair Display, serif').style('font-size', '1.9rem').style('font-weight', '900')
    .style('fill', title === 'today' ? C.female : C.rust)
    .text(title === 'today' ? `${filtered[0].value}%` : `${filtered[0].value}%`);
  g.append('text').attr('text-anchor', 'middle').attr('dy', '1.3em')
    .style('font-family', 'Lora, serif').style('font-size', '0.68rem').style('font-style', 'italic')
    .style('fill', C.sepia).text(centerSub);

  // Legend — horizontal, centred, placed BELOW the ring with guaranteed space
  const legendY   = ringSize + 8;              // 8px gap between ring bottom and legend
  const itemW     = 90;
  const totalLegW = filtered.length * itemW;
  const legendX   = (ringSize - totalLegW) / 2;

  const legend = svg.append('g').attr('transform', `translate(${legendX}, ${legendY})`);
  filtered.forEach((d, i) => {
    const lg = legend.append('g').attr('transform', `translate(${i * itemW}, 0)`);
    lg.append('rect').attr('width', 9).attr('height', 9).attr('rx', 2).attr('fill', d.color);
    lg.append('text').attr('x', 13).attr('y', 8)
      .style('font-family', 'Lora, serif').style('font-size', '9px').style('fill', C.sepia)
      .text(d.label.replace(' authors', '').replace('/Group', ''));
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

  const W = el.clientWidth || 440, H = 250;
  const margin = { top: 10, right: 52, bottom: 26, left: 158 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(DATA.pioneers.map(d => d.name)).range([0, h]).padding(0.4);
  const maxW = d3.max(DATA.pioneers, d => d.weeks);
  const x = d3.scaleLinear().domain([0, maxW * 1.18]).range([0, w]);

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
    .on('mousemove', (e, d) => showTooltip(e, `<strong>${d.name}</strong><br/>${d.weeks} list appearances`))
    .on('mouseleave', hideTooltip)
    .transition().duration(400).delay((d,i) => i*100 + 600)
    .attr('cx', d => x(d.weeks)).attr('r', 7);

  // Labels
  g.selectAll('.week-label').data(DATA.pioneers).enter().append('text')
    .attr('y', d => y(d.name) + y.bandwidth()/2 + 4)
    .attr('x', d => x(d.weeks) + 12)
    .style('font-family', 'Lora, serif').style('font-size', '10px').style('fill', C.female)
    .text(d => d.weeks);

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
// Uses the same fixed drawDonut with title='today' for the centre label logic,
// but calls it directly so CHART_MAP can stay simple.
function drawToday() {
  drawDonut('chart-today', DATA.today, 'today');
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