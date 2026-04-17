// System Constants & Configuration
const COLOR_PRIMARY = '#60A5FA';
const COLOR_SECONDARY = '#818CF8';
const COLOR_NODE = '#A5F3FC'; // Bright cyan
const COLOR_EDGE = 'rgba(255, 255, 255, 0.4)'; // Semi-transparent white
const COLOR_PATH = '#FDE047'; // Bright Yellow
const COLOR_TEXT = '#F8FAFC';

// Pune Locations - Updated Data
const nodes = [
    { id: 'P1', name: 'Shaniwar Wada', x: 100, y: 150 },
    { id: 'P2', name: 'FC Road Market', x: 220, y: 150 },
    { id: 'P3', name: 'Hinjewadi Tech', x: 350, y: 180 },
    { id: 'P4', name: 'Railway Station', x: 240, y: 280 },
    { id: 'P5', name: 'IITM Pashan', x: 280, y: 120 },
    { id: 'P6', name: 'Pune Airport', x: 400, y: 250 }
];

const edges = [
    { from: 'P1', to: 'P2', weight: 3 },
    { from: 'P1', to: 'P4', weight: 5 },
    { from: 'P2', to: 'P5', weight: 8 },
    { from: 'P2', to: 'P3', weight: 15 },
    { from: 'P3', to: 'P6', weight: 12 },
    { from: 'P4', to: 'P6', weight: 10 },
    { from: 'P5', to: 'P3', weight: 10 },
    { from: 'P4', to: 'P5', weight: 12 },
    { from: 'P1', to: 'P5', weight: 14 }
];

// Pune Zone Hierarchy Data (recursive)
const zones = {
    id: 'PUNE01',
    name: 'Pune City',
    type: 'City',
    children: [
        {
            id: 'ZONE01', name: 'Central Pune', type: 'Zone', children: [
                { id: 'AREA01', name: 'Historic Quarter', type: 'Area', children: [
                    { id: 'LOC01', name: 'Shaniwar Wada', type: 'Location' },
                    { id: 'LOC02', name: 'FC Road Market', type: 'Location' }
                ]},
                { id: 'AREA02', name: 'Railway Area', type: 'Area', children: [
                    { id: 'LOC03', name: 'Railway Station', type: 'Location' }
                ]}
            ]
        },
        {
            id: 'ZONE02', name: 'Tech & Airport', type: 'Zone', children: [
                { id: 'AREA03', name: 'IT Parks', type: 'Area', children: [
                    { id: 'LOC04', name: 'Hinjewadi Tech', type: 'Location' },
                    { id: 'LOC05', name: 'IITM Pashan', type: 'Location' }
                ]},
                { id: 'AREA04', name: 'Airport Region', type: 'Area', children: [
                    { id: 'LOC06', name: 'Pune Airport', type: 'Location' }
                ]}
            ]
        }
    ]
};

// Application State
let currentSection = 'home';
let vehicleType = 'NORMAL';
let activePath = [];
let selectedSource = null;
let selectedDest = null;

// DOM Elements - Safely check for existence
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const canvas = document.getElementById('mapCanvas');
const ctx = canvas?.getContext('2d');
const dashboardHero = document.getElementById('dashboard-hero');

// Initialize only if elements exist (for compatibility with index.html)
window.addEventListener('load', () => {
    if (navItems.length > 0) setupNavigation();
    if (document.getElementById('zoneTree')) renderZoneTree(zones, document.getElementById('zoneTree'));
    if (document.getElementById('locationsList')) renderLocations();
    if (canvas && ctx) setupGraphVisualization();
});

// Render Hubs List on the Right
function renderLocations() {
    const list = document.getElementById('locationsList');
    if (!list) return;
    
    list.innerHTML = '';
    nodes.forEach(node => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="info">
                <span class="name">${node.name}</span>
                <span class="id-tag">Location #${node.id}</span>
            </div>
        `;
        
        item.onclick = () => {
            const source = document.getElementById('sourceNode');
            const dest = document.getElementById('destNode');
            if (source && !source.value) {
                source.value = node.id;
            } else if (dest && source && source.value !== node.id) {
                dest.value = node.id;
            }
        };
        list.appendChild(item);
    });
}

function calculateRoute() {
    const source = document.getElementById('sourceNode');
    const dest = document.getElementById('destNode');
    
    if (!source || !dest) return;
    if (!source.value || !dest.value) {
        alert('Please select origin and destination.');
        return;
    }

    const sourceVal = source.value;
    const destVal = dest.value;
    const resultPanel = document.getElementById('routeResult');
    const timelineWidget = document.getElementById('pathTimelineWidget');
    
    if (!resultPanel || !timelineWidget) {
        console.log(`Route: ${sourceVal} -> ${destVal}`);
        return;
    }
    
    // Mock Dijkstra paths for Pune locations
    const mockPaths = {
        'P1-P6': { path: ['P1', 'P2', 'P3', 'P6'], dist: 30 },
        'P1-P3': { path: ['P1', 'P2', 'P3'], dist: 18 },
        'P5-P3': { path: ['P5', 'P3'], dist: 10 },
        'P2-P6': { path: ['P2', 'P3', 'P6'], dist: 27 },
        'default': { path: [sourceVal, 'P4', destVal], dist: 20 }
    };
    
    const key = `${sourceVal}-${destVal}`;
    const result = mockPaths[key] || mockPaths['default'];
    
    activePath = result.path;
    
    resultPanel.style.display = 'block';
    timelineWidget.style.display = 'block';
    document.getElementById('totalDist').innerText = `${result.dist} km`;
    
    const timeMins = Math.round((result.dist / 40) * 60 + (vehicleType === 'EMERGENCY' ? -5 : 0));
    document.getElementById('travelTime').innerText = `${timeMins} mins`;
    
    const timeline = document.getElementById('pathTimeline');
    timeline.innerHTML = '';
    
    result.path.forEach((nodeId, i) => {
        const nodeName = nodes.find(n => n.id === nodeId).name;
        const div = document.createElement('div');
        div.className = 'path-item';
        div.innerHTML = `
            <div style="font-weight: 700; font-size: 14px;">${nodeName}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${i === 0 ? 'Start' : i === result.path.length-1 ? 'Destination' : 'Transit Point'}</div>
        `;
        timeline.appendChild(div);
    });
    
    drawGraph();
}

// Graph Initialization & Drawing
function setupGraphVisualization() {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    drawGraph();
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    edges.forEach(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        
        const isPath = activePath.some((nodeId, i) => 
            (activePath[i] === edge.from && activePath[i+1] === edge.to) ||
            (activePath[i] === edge.to && activePath[i+1] === edge.from)
        );
        
        ctx.strokeStyle = isPath ? COLOR_PATH : COLOR_EDGE;
        ctx.lineWidth = isPath ? 6 : 2;
        
        if (isPath) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLOR_PATH;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        ctx.fillStyle = isPath ? COLOR_PATH : 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 13px Outfit';
        ctx.fillText(edge.weight + ' km', mx, my - 10);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const isPathNode = activePath.includes(node.id);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = isPathNode ? COLOR_PATH : COLOR_NODE;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = isPathNode ? COLOR_PATH : COLOR_NODE;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px Outfit';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.name, node.x - 40, node.y + 28);
        ctx.shadowBlur = 0;
    });
}
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
}

function switchSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.querySelector(`[data-section="${id}"]`).classList.add('active');
    
    if (id === 'route-finder') {
        setTimeout(setupGraphVisualization, 100); // Allow for transition
    }
}

// Tree Rendering Logic
function renderZoneTree(node, parentEl) {
    const li = document.createElement('li');
    li.className = 'tree-node';
    
    const content = document.createElement('div');
    content.className = 'tree-node-content';
    content.innerHTML = `
        <i class="fas ${node.children ? 'fa-chevron-right' : 'fa-circle'} tree-node-icon"></i>
        <span style="font-weight: 500;">${node.name}</span>
        <span style="font-size: 11px; margin-left: 8px; opacity: 0.5;">(${node.type})</span>
    `;
    
    content.onclick = (e) => {
        e.stopPropagation();
        const icon = content.querySelector('.tree-node-icon');
        if (node.children) {
            const childContainer = li.querySelector('.tree-children');
            childContainer.classList.toggle('active');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-right');
        }
        showZoneDetails(node);
    };
    
    li.appendChild(content);
    
    if (node.children) {
        const ul = document.createElement('ul');
        ul.className = 'tree-children';
        node.children.forEach(child => renderZoneTree(child, ul));
        li.appendChild(ul);
    }
    
    parentEl.appendChild(li);
}

function showZoneDetails(node) {
    const detailPanel = document.getElementById('zoneDetails');
    detailPanel.innerHTML = `
        <h3 style="margin-bottom: 20px;">${node.name} Details</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                <span style="display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Unique Identifier</span>
                <span style="font-weight: 600;">#${node.id}</span>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                <span style="display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Category</span>
                <span style="font-weight: 600;">${node.type}</span>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                <span style="display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Infrastructure Status</span>
                <span style="font-weight: 600; color: var(--success);"><i class="fas fa-check-circle"></i> Operational</span>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                <span style="display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Children Nodes</span>
                <span style="font-weight: 600;">${node.children ? node.children.length : 0} Count</span>
            </div>
        </div>
    `;
}

// Graph Logic
function setupGraphVisualization() {
    if (!ctx) return;
    
    // Scale for canvas resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    drawGraph();
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    edges.forEach(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        
        // Highlight if part of active path
        const isPath = activePath.some((nodeId, i) => 
            (activePath[i] === edge.from && activePath[i+1] === edge.to) ||
            (activePath[i] === edge.to && activePath[i+1] === edge.from)
        );
        
        ctx.strokeStyle = isPath ? COLOR_PATH : COLOR_EDGE;
        ctx.lineWidth = isPath ? 6 : 2;
        
        if (isPath) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLOR_PATH;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Weight labels
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        ctx.fillStyle = isPath ? COLOR_PATH : 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 13px Outfit';
        ctx.fillText(edge.weight + ' km', mx, my - 10);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const isPathNode = activePath.includes(node.id);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = isPathNode ? COLOR_PATH : COLOR_NODE;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = isPathNode ? COLOR_PATH : COLOR_NODE;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px Outfit';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.name, node.x - 40, node.y + 28);
        ctx.shadowBlur = 0;
    });
}

// Route Finding Simulator
function setupRouteFinder() {
    const findBtn = document.getElementById('findRouteBtn');
    if (!findBtn) return;
    
    findBtn.onclick = () => {
        const source = document.getElementById('sourceNode').value;
        const dest = document.getElementById('destNode').value;
        const resultPanel = document.getElementById('routeResult');
        
        if (!source || !dest) {
            alert('Please select both origin and destination.');
            return;
        }
        
        if (source === dest) {
            alert('Origin and destination must be different.');
            return;
        }
        
        // Show loading state
        findBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Best Route...';
        findBtn.disabled = true;
        
        // Simulate computation time
        setTimeout(() => {
            // Mock Dijkstra paths
            const mockPaths = {
                'A-F': { path: ['A', 'B', 'C', 'F'], dist: 40 },
                'A-C': { path: ['A', 'B', 'C'], dist: 22 },
                'E-C': { path: ['E', 'A', 'B', 'C'], dist: 37 },
                'default': { path: [source, 'D', dest], dist: 40 }
            };
            
            const key = `${source}-${dest}`;
            const result = mockPaths[key] || mockPaths['default'];
            
            activePath = result.path;
            
            // Render UI result
            resultPanel.style.display = 'block';
            document.getElementById('totalDist').innerText = `${result.dist} km`;
            
            // Calculate time (avg 40km/h)
            const timeMins = Math.round((result.dist / 40) * 60 + (vehicleType === 'EMERGENCY' ? -5 : 0));
            document.getElementById('travelTime').innerText = `${timeMins} mins`;
            
            const timeline = document.getElementById('pathTimeline');
            timeline.innerHTML = '';
            
            result.path.forEach((nodeId, i) => {
                const nodeName = nodes.find(n => n.id === nodeId).name;
                const div = document.createElement('div');
                div.className = 'path-item';
                div.innerHTML = `
                    <div style="font-weight: 700; font-size: 14px;">${nodeName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${i === 0 ? 'Start' : i === result.path.length-1 ? 'Destination' : 'Drive thru District'}</div>
                `;
                timeline.appendChild(div);
            });
            
            findBtn.innerHTML = 'Get Directions';
            findBtn.disabled = false;
            
            drawGraph();
        }, 1200);
    };
}

window.setVehicle = (type) => {
    vehicleType = type;
    document.querySelectorAll('.vehicle-option').forEach(opt => opt.classList.remove('active'));
    if (type === 'NORMAL') {
        document.querySelector('.vehicle-option.normal').classList.add('active');
    } else {
        document.querySelector('.vehicle-option.emergency').classList.add('active');
    }
}
