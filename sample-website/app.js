/**
 * Supply Chain Control Tower Dashboard Script
 * Implements: Theme toggles, interactive region filtering, Chart.js updates,
 * HTML5 Canvas route animations, and real-time telemetry simulation.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════
     STATE & MOCK DATA SYSTEM
     ═══════════════════════════════════════════════════ */
  const state = {
    theme: localStorage.getItem('sc-theme') || 'dark',
    region: 'global',
    isMobileMenuOpen: false
  };

  const regionData = {
    global: {
      kpi: { otif: '96.8%', inventory: '11.4x', cost: '$1.15M', carbon: '208 t' },
      kpiTrends: { otif: '+1.2%', inventory: '-0.4x', cost: '-$48K', carbon: '-5.2%' },
      kpiStatus: { otif: 'up', inventory: 'down', cost: 'up', carbon: 'up' },
      inventory: {
        labels: Array.from({length: 12}, (_, i) => `Wk ${i+1}`),
        current: [110, 115, 108, 98, 104, 112, 120, 125, 118, 112, 105, 102],
        forecast: [108, 112, 115, 105, 100, 110, 118, 122, 120, 115, 110, 105]
      },
      carriers: {
        labels: ['Apex Global', 'SwiftLink Sea', 'Nordic Aero', 'Atlas Freight', 'Pacific Rail'],
        otif: [97.5, 94.2, 98.9, 95.8, 92.1]
      },
      shipments: [
        { id: 'SH-8942', route: 'Shenzhen → Berlin', carrier: 'Nordic Aero', status: 'transit', eta: '2 days' },
        { id: 'SH-5412', route: 'Shanghai → LA', carrier: 'Atlas Freight', status: 'transit', eta: '4 days' },
        { id: 'SH-6291', route: 'Houston → Rotterdam', carrier: 'SwiftLink Sea', status: 'delayed', eta: '7 days' },
        { id: 'SH-3108', route: 'Singapore → Hamburg', carrier: 'SwiftLink Sea', status: 'delivered', eta: 'Delivered' },
        { id: 'SH-1102', route: 'New York → London', carrier: 'Apex Global', status: 'transit', eta: '12 hours' }
      ],
      alerts: [
        { severity: 'critical', title: 'Port Congestion Delay', desc: 'Rotterdam Port customs experiencing 48hr backlogs. High priority rerouting activated.', time: '08:42 UTC' },
        { severity: 'warning', title: 'Storm Pre-Alert', desc: 'Atlantic Typhoon warning on US East Coast corridors. Oceanic freight delayed by 18 hours.', time: '09:15 UTC' },
        { severity: 'info', title: 'Route Optimization Complete', desc: 'Apex Flight #948 switched to direct polar route. Carbon footprint reduced by 1.2t.', time: '10:04 UTC' }
      ]
    },
    europe: {
      kpi: { otif: '97.4%', inventory: '12.1x', cost: '$480K', carbon: '68 t' },
      kpiTrends: { otif: '+1.8%', inventory: '+0.5x', cost: '-$12K', carbon: '-6.8%' },
      kpiStatus: { otif: 'up', inventory: 'up', cost: 'up', carbon: 'up' },
      inventory: {
        labels: Array.from({length: 12}, (_, i) => `Wk ${i+1}`),
        current: [42, 45, 48, 44, 40, 46, 50, 52, 48, 45, 42, 41],
        forecast: [40, 43, 46, 45, 42, 45, 48, 50, 49, 46, 43, 42]
      },
      carriers: {
        labels: ['Apex Global', 'SwiftLink Sea', 'Nordic Aero', 'Atlas Freight'],
        otif: [98.1, 95.0, 99.2, 96.1]
      },
      shipments: [
        { id: 'SH-8942', route: 'Shenzhen → Berlin', carrier: 'Nordic Aero', status: 'transit', eta: '2 days' },
        { id: 'SH-3108', route: 'Singapore → Hamburg', carrier: 'SwiftLink Sea', status: 'delivered', eta: 'Delivered' },
        { id: 'SH-1102', route: 'New York → London', carrier: 'Apex Global', status: 'transit', eta: '12 hours' }
      ],
      alerts: [
        { severity: 'critical', title: 'Port Congestion Delay', desc: 'Rotterdam Port customs experiencing 48hr backlogs. High priority rerouting activated.', time: '08:42 UTC' },
        { severity: 'info', title: 'Route Optimization Complete', desc: 'Apex Flight #948 switched to direct polar route. Carbon footprint reduced by 1.2t.', time: '10:04 UTC' }
      ]
    },
    northamerica: {
      kpi: { otif: '95.9%', inventory: '10.8x', cost: '$410K', carbon: '92 t' },
      kpiTrends: { otif: '-0.3%', inventory: '-0.8x', cost: '-$20K', carbon: '-4.1%' },
      kpiStatus: { otif: 'down', inventory: 'down', cost: 'up', carbon: 'up' },
      inventory: {
        labels: Array.from({length: 12}, (_, i) => `Wk ${i+1}`),
        current: [38, 39, 36, 32, 34, 38, 42, 44, 41, 38, 35, 34],
        forecast: [39, 40, 38, 34, 32, 36, 40, 43, 42, 39, 36, 34]
      },
      carriers: {
        labels: ['Apex Global', 'SwiftLink Sea', 'Atlas Freight', 'Pacific Rail'],
        otif: [96.8, 93.5, 95.4, 92.1]
      },
      shipments: [
        { id: 'SH-5412', route: 'Shanghai → LA', carrier: 'Atlas Freight', status: 'transit', eta: '4 days' },
        { id: 'SH-6291', route: 'Houston → Rotterdam', carrier: 'SwiftLink Sea', status: 'delayed', eta: '7 days' }
      ],
      alerts: [
        { severity: 'warning', title: 'Storm Pre-Alert', desc: 'Atlantic Typhoon warning on US East Coast corridors. Oceanic freight delayed by 18 hours.', time: '09:15 UTC' }
      ]
    },
    apac: {
      kpi: { otif: '97.1%', inventory: '11.8x', cost: '$260K', carbon: '48 t' },
      kpiTrends: { otif: '+0.9%', inventory: '+0.2x', cost: '-$16K', carbon: '-5.8%' },
      kpiStatus: { otif: 'up', inventory: 'up', cost: 'up', carbon: 'up' },
      inventory: {
        labels: Array.from({length: 12}, (_, i) => `Wk ${i+1}`),
        current: [30, 31, 34, 32, 30, 31, 33, 35, 33, 31, 30, 29],
        forecast: [29, 31, 32, 31, 29, 30, 32, 34, 33, 31, 30, 29]
      },
      carriers: {
        labels: ['Apex Global', 'SwiftLink Sea', 'Nordic Aero', 'Atlas Freight'],
        otif: [97.9, 94.8, 98.4, 96.0]
      },
      shipments: [
        { id: 'SH-8942', route: 'Shenzhen → Berlin', carrier: 'Nordic Aero', status: 'transit', eta: '2 days' },
        { id: 'SH-3108', route: 'Singapore → Hamburg', carrier: 'SwiftLink Sea', status: 'delivered', eta: 'Delivered' }
      ],
      alerts: [
        { severity: 'info', title: 'Regional Demand Spike', desc: 'High seasonal volume detected in APAC warehouses. Dynamic storage allocation completed.', time: '06:12 UTC' }
      ]
    }
  };

  /* ═══════════════════════════════════════════════════
     DOM ELEMENTS
     ═══════════════════════════════════════════════════ */
  const body = document.body;
  const regionSelect = document.getElementById('regionSelect');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const refreshBtn = document.getElementById('refreshBtn');
  
  const valOtif = document.getElementById('val-otif');
  const valInventory = document.getElementById('val-inventory');
  const valCost = document.getElementById('val-cost');
  const valCarbon = document.getElementById('val-carbon');
  
  const trendOtif = document.getElementById('trend-otif');
  const trendInventory = document.getElementById('trend-inventory');
  const trendCost = document.getElementById('trend-cost');
  const trendCarbon = document.getElementById('trend-carbon');
  
  const alertLogContainer = document.getElementById('alertLogContainer');
  const shipmentsTableBody = document.getElementById('shipmentsTableBody');
  const activeRouteCount = document.getElementById('activeRouteCount');

  /* ═══════════════════════════════════════════════════
     THEMING ENGINE
     ═══════════════════════════════════════════════════ */
  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? '🌞' : '🌙';
    localStorage.setItem('sc-theme', theme);
    state.theme = theme;
    
    // Refresh chart colors based on theme
    if (inventoryChartInstance && carrierChartInstance) {
      updateChartColors();
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Load saved theme
  applyTheme(state.theme);

  /* ═══════════════════════════════════════════════════
     CHART.JS IMPLEMENTATION
     ═══════════════════════════════════════════════════ */
  let inventoryChartInstance = null;
  let carrierChartInstance = null;

  function getChartThemeColors() {
    const isDark = state.theme === 'dark';
    return {
      gridColor: isDark ? 'rgba(0, 229, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      textColor: isDark ? '#94a3b8' : '#475569',
      accentColor: isDark ? '#00e5ff' : '#0284c7',
      secondColor: isDark ? '#10b981' : '#059669',
    };
  }

  function initCharts() {
    const ctxInv = document.getElementById('inventoryChart').getContext('2d');
    const ctxCarrier = document.getElementById('carrierChart').getContext('2d');
    const colors = getChartThemeColors();

    // Inventory Line Chart
    inventoryChartInstance = new Chart(ctxInv, {
      type: 'line',
      data: {
        labels: regionData.global.inventory.labels,
        datasets: [
          {
            label: 'Actual Inventory Level',
            data: regionData.global.inventory.current,
            borderColor: colors.accentColor,
            backgroundColor: 'rgba(0, 229, 255, 0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: colors.accentColor
          },
          {
            label: 'ARIMA Demand Forecast',
            data: regionData.global.inventory.forecast,
            borderColor: colors.secondColor,
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: colors.textColor,
              font: { family: 'Outfit', size: 12 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: 'Space Mono', size: 10 } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: 'Space Mono', size: 10 } }
          }
        }
      }
    });

    // Carrier Performance Radar/Horizontal Bar
    carrierChartInstance = new Chart(ctxCarrier, {
      type: 'bar',
      data: {
        labels: regionData.global.carriers.labels,
        datasets: [{
          label: 'OTIF %',
          data: regionData.global.carriers.otif,
          backgroundColor: [
            'rgba(0, 229, 255, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            min: 80,
            max: 100,
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: 'Space Mono', size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: 'Outfit', size: 11 } }
          }
        }
      }
    });
  }

  function updateChartColors() {
    const colors = getChartThemeColors();
    
    // Line Chart
    inventoryChartInstance.data.datasets[0].borderColor = colors.accentColor;
    inventoryChartInstance.data.datasets[0].pointBackgroundColor = colors.accentColor;
    inventoryChartInstance.data.datasets[1].borderColor = colors.secondColor;
    inventoryChartInstance.options.scales.x.grid.color = colors.gridColor;
    inventoryChartInstance.options.scales.x.ticks.color = colors.textColor;
    inventoryChartInstance.options.scales.y.grid.color = colors.gridColor;
    inventoryChartInstance.options.scales.y.ticks.color = colors.textColor;
    inventoryChartInstance.options.plugins.legend.labels.color = colors.textColor;
    inventoryChartInstance.update();
    
    // Bar Chart
    carrierChartInstance.options.scales.x.grid.color = colors.gridColor;
    carrierChartInstance.options.scales.x.ticks.color = colors.textColor;
    carrierChartInstance.options.scales.y.ticks.color = colors.textColor;
    carrierChartInstance.update();
  }

  function updateChartsData(data) {
    if (!inventoryChartInstance || !carrierChartInstance) return;
    
    // Update Line Chart
    inventoryChartInstance.data.labels = data.inventory.labels;
    inventoryChartInstance.data.datasets[0].data = data.inventory.current;
    inventoryChartInstance.data.datasets[1].data = data.inventory.forecast;
    inventoryChartInstance.update();
    
    // Update Bar Chart
    carrierChartInstance.data.labels = data.carriers.labels;
    carrierChartInstance.data.datasets[0].data = data.carriers.otif;
    carrierChartInstance.update();
  }

  /* ═══════════════════════════════════════════════════
     CANVAS VECTOR MAP ANIMATION
     ═══════════════════════════════════════════════════ */
  const canvas = document.getElementById('routeCanvas');
  const ctxMap = canvas.getContext('2d');
  let animationFrameId = null;

  // Logistics nodes coordinates (normalized 0 to 1000)
  const nodes = {
    Shanghai: { x: 740, y: 460, name: 'Shanghai (SHG)' },
    Singapore: { x: 710, y: 640, name: 'Singapore (SIN)' },
    Rotterdam: { x: 440, y: 280, name: 'Rotterdam (RTM)' },
    LosAngeles: { x: 160, y: 380, name: 'Los Angeles (LAX)' },
    NewYork: { x: 260, y: 340, name: 'New York (NYC)' },
    Houston: { x: 220, y: 400, name: 'Houston (HOU)' },
    Sydney: { x: 840, y: 760, name: 'Sydney (SYD)' },
    Berlin: { x: 470, y: 270, name: 'Berlin (BER)' },
    Shenzhen: { x: 730, y: 490, name: 'Shenzhen (SZX)' }
  };

  // Connect routes
  const activeRoutes = [
    { from: nodes.Shenzhen, to: nodes.Berlin, type: 'air', progress: 0.15, speed: 0.003, color: '#00e5ff' },
    { from: nodes.Shanghai, to: nodes.LosAngeles, type: 'ocean', progress: 0.45, speed: 0.001, color: '#10b981' },
    { from: nodes.Singapore, to: nodes.Rotterdam, type: 'ocean', progress: 0.70, speed: 0.0008, color: '#10b981' },
    { from: nodes.Houston, to: nodes.Rotterdam, type: 'ocean', progress: 0.30, speed: 0.0012, color: '#ef4444' }, // Delayed route
    { from: nodes.NewYork, to: nodes.Berlin, type: 'air', progress: 0.85, speed: 0.004, color: '#00e5ff' },
    { from: nodes.Sydney, to: nodes.Singapore, type: 'air', progress: 0.50, speed: 0.0025, color: '#00e5ff' }
  ];

  // Auto-resize canvas
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth * window.devicePixelRatio;
    canvas.height = parent.clientHeight * window.devicePixelRatio;
    ctxMap.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Draw high-tech dashboard grid background
  function drawMapGrid(w, h) {
    ctxMap.strokeStyle = state.theme === 'dark' ? 'rgba(0, 229, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    ctxMap.lineWidth = 1;
    const step = 40;
    
    for (let x = 0; x < w; x += step) {
      ctxMap.beginPath();
      ctxMap.moveTo(x, 0);
      ctxMap.lineTo(x, h);
      ctxMap.stroke();
    }
    
    for (let y = 0; y < h; y += step) {
      ctxMap.beginPath();
      ctxMap.moveTo(0, y);
      ctxMap.lineTo(w, y);
      ctxMap.stroke();
    }
  }

  // Curve interpolation for shipping arcs
  function getQuadraticBezierPoint(p0, p1, p2, t) {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  }

  // Draw global connections and animation loops
  function renderMapAnimation() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctxMap.clearRect(0, 0, w, h);
    drawMapGrid(w, h);

    // Scaling helpers
    const scaleX = (x) => (x / 1000) * w;
    const scaleY = (y) => (y / 1000) * h;

    // Draw route arcs
    activeRoutes.forEach(route => {
      const fromX = scaleX(route.from.x);
      const fromY = scaleY(route.from.y);
      const toX = scaleX(route.to.x);
      const toY = scaleY(route.to.y);
      
      // Control point for arc height
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 - 80; 

      ctxMap.beginPath();
      ctxMap.moveTo(fromX, fromY);
      ctxMap.quadraticCurveTo(midX, midY, toX, toY);
      ctxMap.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';
      ctxMap.lineWidth = route.type === 'ocean' ? 1.5 : 1;
      if (route.type === 'air') ctxMap.setLineDash([4, 4]);
      else ctxMap.setLineDash([]);
      ctxMap.stroke();
      ctxMap.setLineDash([]); // Reset line dash

      // Increment shipment position progress
      route.progress += route.speed;
      if (route.progress > 1) {
        route.progress = 0; // Loop back
      }

      // Calculate exact dynamic dot location on bezier arc
      const pos = getQuadraticBezierPoint(
        { x: fromX, y: fromY },
        { x: midX, y: midY },
        { x: toX, y: toY },
        route.progress
      );

      // Draw glowing pulse ring around cargo dot
      ctxMap.beginPath();
      ctxMap.arc(pos.x, pos.y, 8 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
      ctxMap.fillStyle = route.color + '22';
      ctxMap.fill();

      // Draw active cargo dot
      ctxMap.beginPath();
      ctxMap.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctxMap.fillStyle = route.color;
      ctxMap.fill();
    });

    // Draw node pins
    Object.keys(nodes).forEach(key => {
      const node = nodes[key];
      const nX = scaleX(node.x);
      const nY = scaleY(node.y);

      // Pulse rings for major hubs
      ctxMap.beginPath();
      ctxMap.arc(nX, nY, 12, 0, Math.PI * 2);
      ctxMap.strokeStyle = state.theme === 'dark' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(37, 99, 235, 0.1)';
      ctxMap.lineWidth = 1;
      ctxMap.stroke();

      // Core anchor pin
      ctxMap.beginPath();
      ctxMap.arc(nX, nY, 3.5, 0, Math.PI * 2);
      ctxMap.fillStyle = state.theme === 'dark' ? '#00e5ff' : '#2563eb';
      ctxMap.fill();

      // Node label (Space Mono style)
      ctxMap.fillStyle = state.theme === 'dark' ? '#64748b' : '#94a3b8';
      ctxMap.font = '700 8px "Space Mono", monospace';
      ctxMap.textAlign = 'center';
      ctxMap.fillText(node.name.split(' ')[0], nX, nY - 8);
    });

    animationFrameId = requestAnimationFrame(renderMapAnimation);
  }

  // Interactivity: clicking canvas leaves glowing pulse particle
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Trigger canvas sonar ring
    let size = 0;
    const animateClick = () => {
      if (size > 40) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      // Let's re-render nodes, but draw a ring around clicked area.
      // To keep it simple, we add a mock shipment alert from clicked location!
      size += 2.5;
    };
    animateClick();

    // Dynamically insert simulated notification log
    const randomExc = [
      'Customs clearance pre-approved for Atlantic container block.',
      'Ocean freight carrier SwiftLink Sea reports normal swell conditions.',
      'GPS gateway handshake successful. Signal latency 14ms.'
    ];
    
    addSimulatedAlert('info', 'Ping Success', randomExc[Math.floor(Math.random() * randomExc.length)]);
  });

  // Re-fit canvas sizing on resize
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    renderMapAnimation();
  });

  // Initial sizing and kick-off
  resizeCanvas();
  renderMapAnimation();

  /* ═══════════════════════════════════════════════════
     DATA BINDING & INTERACTIVITY HANDLERS
     ═══════════════════════════════════════════════════ */
  function updateDashboardUI(regionKey) {
    const data = regionData[regionKey];
    if (!data) return;

    // Update KPI Text Content
    animateValue(valOtif, data.kpi.otif);
    animateValue(valInventory, data.kpi.inventory);
    animateValue(valCost, data.kpi.cost);
    animateValue(valCarbon, data.kpi.carbon);

    // Update trends
    updateTrendBadge(trendOtif, data.kpiTrends.otif, data.kpiStatus.otif);
    updateTrendBadge(trendInventory, data.kpiTrends.inventory, data.kpiStatus.inventory);
    updateTrendBadge(trendCost, data.kpiTrends.cost, data.kpiStatus.cost);
    updateTrendBadge(trendCarbon, data.kpiTrends.carbon, data.kpiStatus.carbon);

    // Update Active Charts
    updateChartsData(data);

    // Populate active shipments table
    shipmentsTableBody.innerHTML = '';
    data.shipments.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family:'Space Mono', monospace; font-weight:700; color:var(--accent-cyan);">${item.id}</td>
        <td>${item.route}</td>
        <td>${item.carrier}</td>
        <td><span class="badge-status status-${item.status}">${item.status}</span></td>
        <td style="font-weight:600;">${item.eta}</td>
      `;
      shipmentsTableBody.appendChild(tr);
    });

    // Populate alert box
    alertLogContainer.innerHTML = '';
    data.alerts.forEach(alert => {
      alertLogContainer.appendChild(createAlertElement(alert.severity, alert.title, alert.desc, alert.time));
    });

    // Update Route text count
    activeRouteCount.textContent = `${data.shipments.filter(s => s.status === 'transit').length} ACTIVE CORRIDORS IN TRANSIT`;
  }

  // Smooth numeric counter changes
  function animateValue(element, newValue) {
    element.style.opacity = 0;
    setTimeout(() => {
      element.textContent = newValue;
      element.style.opacity = 1;
      element.style.transition = 'opacity 0.25s ease';
    }, 200);
  }

  function updateTrendBadge(element, text, status) {
    element.textContent = text;
    element.className = 'trend-badge';
    if (status === 'up') {
      element.classList.add('trend-up');
    } else if (status === 'down') {
      element.classList.add('trend-down');
    } else {
      element.classList.add('trend-neutral');
    }
  }

  function createAlertElement(severity, title, desc, time) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.innerHTML = `
      <div class="alert-severity severity-${severity}"></div>
      <div class="alert-content">
        <div class="alert-header">
          <span class="alert-title">${title}</span>
          <span class="alert-time">${time}</span>
        </div>
        <p class="alert-desc">${desc}</p>
      </div>
    `;
    return alertDiv;
  }

  function addSimulatedAlert(severity, title, desc) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const alertEl = createAlertElement(severity, title, desc, timeStr);
    
    // Prepend to top of logs container
    if (alertLogContainer.firstChild) {
      alertLogContainer.insertBefore(alertEl, alertLogContainer.firstChild);
    } else {
      alertLogContainer.appendChild(alertEl);
    }

    // Scroll to top of alerts
    alertLogContainer.scrollTop = 0;
  }

  // Region dropdown change listener
  regionSelect.addEventListener('change', (e) => {
    state.region = e.target.value;
    updateDashboardUI(state.region);
  });

  // Simulator Telemetry Event
  refreshBtn.addEventListener('click', () => {
    // Generate flash glow on button
    refreshBtn.style.transform = 'scale(0.95)';
    setTimeout(() => refreshBtn.style.transform = 'scale(1)', 100);

    // Inject temporary delay alert
    const routes = ['Atlantic Sea Freight', 'North Rail Transit Corridor', 'APAC Air Cargo Link', 'SZX-LAX Ocean Liner'];
    const selectedRoute = routes[Math.floor(Math.random() * routes.length)];
    
    addSimulatedAlert(
      'warning', 
      'Dynamic Telemetry Recalculation', 
      `Minor turbulence adjustment triggered on ${selectedRoute}. Optimization models rerouting cargo nodes.`
    );

    // Randomize telemetry numbers slightly to show live simulation
    const currentRegion = regionSelect.value;
    const baseVal = regionData[currentRegion].kpi;
    
    // OTIF shift
    const otifFloat = parseFloat(baseVal.otif) + (Math.random() * 0.4 - 0.2);
    valOtif.textContent = otifFloat.toFixed(1) + '%';

    // Carbon shift
    const carbonInt = parseInt(baseVal.carbon) + Math.floor(Math.random() * 6 - 3);
    valCarbon.textContent = carbonInt + ' t';
  });

  /* ═══════════════════════════════════════════════════
     SIDEBAR DRAWER & RESPONSIVE TOGGLES
     ═══════════════════════════════════════════════════ */
  mobileMenuBtn.addEventListener('click', () => {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    if (state.isMobileMenuOpen) {
      sidebar.style.display = 'flex';
      sidebar.style.position = 'fixed';
      sidebar.style.width = '260px';
      sidebar.style.height = '100vh';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.boxShadow = '0 0 40px rgba(0,0,0,0.8)';
      mobileMenuBtn.textContent = '✕';
    } else {
      sidebar.style.display = 'none';
      mobileMenuBtn.textContent = '☰';
    }
  });

  // Smooth scroll links inside sidebar
  document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetHref = this.getAttribute('href');
      
      if (targetHref.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(targetHref);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Remove active class and set this
        document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
        this.parentElement.classList.add('active');
        
        // If mobile, auto-close drawer
        if (window.innerWidth <= 768) {
          sidebar.style.display = 'none';
          mobileMenuBtn.textContent = '☰';
          state.isMobileMenuOpen = false;
        }
      }
    });
  });

  /* ═══════════════════════════════════════════════════
     BOOTSTRAP INITIALIZATION
     ═══════════════════════════════════════════════════ */
  initCharts();
  updateDashboardUI('global');

});
