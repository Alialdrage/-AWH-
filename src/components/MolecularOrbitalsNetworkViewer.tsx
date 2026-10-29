import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Zap,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  Atom,
  CircleDot,
  Activity,
  Sliders,
} from 'lucide-react';

interface ResidueNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  residueNumber: number;
  type: 'charged_pos' | 'charged_neg' | 'polar' | 'hydrophobic' | 'aromatic' | 'metal_ion';
  charge: number;
  orbitalType: string;
  electronDensity: number;
  color: string;
  description: string;
}

interface InteractionLink extends d3.SimulationLinkDatum<ResidueNode> {
  source: string | ResidueNode;
  target: string | ResidueNode;
  interactionType: 'covalent' | 'h_bond' | 'salt_bridge' | 'pi_stacking' | 'disulfide';
  distanceAngstrom: number;
  energyKcal: number;
}

interface MolecularOrbitalsNetworkViewerProps {
  uniprotId: string;
  geneName?: string;
  proteinName?: string;
  averagePlddt?: number;
}

export const MolecularOrbitalsNetworkViewer: React.FC<MolecularOrbitalsNetworkViewerProps> = ({
  uniprotId,
  geneName = 'TP53',
  proteinName = 'Protein Complex',
  averagePlddt = 88.5,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Orbital Display Modes
  const [orbitalMode, setOrbitalMode] = useState<'density' | 'homo' | 'lumo' | 'electrostatic'>('density');
  const [showOrbitalClouds, setShowOrbitalClouds] = useState(true);
  const [selectedNode, setSelectedNode] = useState<ResidueNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [chargeScale, setChargeScale] = useState<number>(1.2);

  // Generate dynamic residue network based on the protein
  const getNetworkData = () => {
    const isP53 = uniprotId.toUpperCase().includes('P04637') || geneName.toUpperCase().includes('TP53');
    const isAbl1 = uniprotId.toUpperCase().includes('P00520') || geneName.toUpperCase().includes('ABL1');

    let nodes: ResidueNode[] = [];
    let links: InteractionLink[] = [];

    if (isP53) {
      nodes = [
        { id: 'R248', name: 'Arg248', residueNumber: 248, type: 'charged_pos', charge: +1, orbitalType: 'sp2 Guanidinium π-delocalized', electronDensity: 0.94, color: '#38bdf8', description: 'يتفاعل مباشرة مع الثلم الصغير للدنا عبر روابط هيدروجينية مدارية' },
        { id: 'R273', name: 'Arg273', residueNumber: 273, type: 'charged_pos', charge: +1, orbitalType: 'sp2 Delocalized', electronDensity: 0.91, color: '#38bdf8', description: 'تثبيت العمود الفقري لجزيء الدنا' },
        { id: 'C176', name: 'Cys176', residueNumber: 176, type: 'polar', charge: -0.2, orbitalType: 'sp3 Thiolate lone pair', electronDensity: 0.88, color: '#fbbf24', description: 'تنسيق أيون الخارصين التماثلي' },
        { id: 'H179', name: 'His179', residueNumber: 179, type: 'aromatic', charge: +0.4, orbitalType: 'sp2 Imidazole π-ring', electronDensity: 0.86, color: '#c084fc', description: 'ربط مداري رباعي السطوح مع الزنك' },
        { id: 'C238', name: 'Cys238', residueNumber: 238, type: 'polar', charge: -0.2, orbitalType: 'sp3 S-p orbital', electronDensity: 0.85, color: '#fbbf24', description: 'مخلب الكبريت لموقع الزنك الحفاز' },
        { id: 'C242', name: 'Cys242', residueNumber: 242, type: 'polar', charge: -0.2, orbitalType: 'sp3 Thiolate', electronDensity: 0.87, color: '#fbbf24', description: 'تنسيق استقرار الجيب الرابط' },
        { id: 'ZN', name: 'Zn²⁺ Ion', residueNumber: 394, type: 'metal_ion', charge: +2, orbitalType: '3d10 Coordination orbital', electronDensity: 0.98, color: '#34d399', description: 'أيون خارصين محوري لتثبيت بنية نطاق الارتباط بالدنا' },
        { id: 'E180', name: 'Glu180', residueNumber: 180, type: 'charged_neg', charge: -1, orbitalType: 'sp2 Carboxylate π-system', electronDensity: 0.89, color: '#f87171', description: 'تكوين جسر ملحي كهروستاتيكي' },
        { id: 'W146', name: 'Trp146', residueNumber: 146, type: 'aromatic', charge: 0, orbitalType: 'Conjugated Indole 10π-system', electronDensity: 0.95, color: '#e879f9', description: 'تكدس مداري عطري π-π Stacking لب النطاق' },
        { id: 'S241', name: 'Ser241', residueNumber: 241, type: 'polar', charge: 0, orbitalType: 'sp3 Hydroxyl lone pairs', electronDensity: 0.78, color: '#67e8f9', description: 'مانح رابطة هيدروجينية للقواعد النيتروجينية' },
      ];

      links = [
        { source: 'C176', target: 'ZN', interactionType: 'covalent', distanceAngstrom: 2.32, energyKcal: -45.0 },
        { source: 'H179', target: 'ZN', interactionType: 'covalent', distanceAngstrom: 2.05, energyKcal: -42.0 },
        { source: 'C238', target: 'ZN', interactionType: 'covalent', distanceAngstrom: 2.30, energyKcal: -46.5 },
        { source: 'C242', target: 'ZN', interactionType: 'covalent', distanceAngstrom: 2.34, energyKcal: -44.2 },
        { source: 'R248', target: 'S241', interactionType: 'h_bond', distanceAngstrom: 2.85, energyKcal: -6.4 },
        { source: 'R273', target: 'E180', interactionType: 'salt_bridge', distanceAngstrom: 3.10, energyKcal: -12.5 },
        { source: 'W146', target: 'H179', interactionType: 'pi_stacking', distanceAngstrom: 3.80, energyKcal: -4.8 },
        { source: 'E180', target: 'H179', interactionType: 'covalent', distanceAngstrom: 1.33, energyKcal: -82.0 },
        { source: 'C238', target: 'S241', interactionType: 'covalent', distanceAngstrom: 3.65, energyKcal: -3.2 },
      ];
    } else {
      // General dynamic model for any queried UniProt ID
      const baseResidues = [
        { id: 'RES1', name: 'Lys32', num: 32, type: 'charged_pos' as const, c: +1, orb: 'sp3 Amine σ-orbital', desc: 'تفاعل قطبي نشط' },
        { id: 'RES2', name: 'Asp68', num: 68, type: 'charged_neg' as const, c: -1, orb: 'sp2 Carboxylate π-system', desc: 'جسر كهروستاتيكي ملحي' },
        { id: 'RES3', name: 'Phe85', num: 85, type: 'aromatic' as const, c: 0, orb: 'Aromatic Benzene 6π-ring', desc: 'تكدس مداري عطري في القلب الكاره للماء' },
        { id: 'RES4', name: 'Tyr102', num: 102, type: 'aromatic' as const, c: 0, orb: 'sp2 Phenolic π-cloud', desc: 'موقع فسفرة ومستقبل مداري' },
        { id: 'RES5', name: 'Cys145', num: 145, type: 'polar' as const, c: -0.1, orb: 'sp3 Thiol orbital', desc: 'جسر ثنائي الكبريتيد المحتمل' },
        { id: 'RES6', name: 'Cys180', num: 180, type: 'polar' as const, c: -0.1, orb: 'sp3 Thiol orbital', desc: 'تثبيت بنيوي تساهمي' },
        { id: 'RES7', name: 'His210', num: 210, type: 'charged_pos' as const, c: +0.6, orb: 'sp2 Imidazole resonance', desc: 'تبادل بروتوني في المركز التحفيزي' },
        { id: 'RES8', name: 'Glu245', num: 245, type: 'charged_neg' as const, c: -1, orb: 'sp2 Carbonyl lone pair', desc: 'رابطة كهروستاتيكية قوية' },
      ];

      nodes = baseResidues.map((r, i) => ({
        id: r.id,
        name: r.name,
        residueNumber: r.num,
        type: r.type,
        charge: r.c,
        orbitalType: r.orb,
        electronDensity: 0.80 + (i * 0.02),
        color: r.type === 'charged_pos' ? '#38bdf8' : r.type === 'charged_neg' ? '#f87171' : r.type === 'aromatic' ? '#c084fc' : '#fbbf24',
        description: r.desc,
      }));

      links = [
        { source: 'RES1', target: 'RES2', interactionType: 'salt_bridge', distanceAngstrom: 2.95, energyKcal: -11.8 },
        { source: 'RES3', target: 'RES4', interactionType: 'pi_stacking', distanceAngstrom: 3.75, energyKcal: -5.2 },
        { source: 'RES5', target: 'RES6', interactionType: 'disulfide', distanceAngstrom: 2.05, energyKcal: -62.0 },
        { source: 'RES7', target: 'RES8', interactionType: 'h_bond', distanceAngstrom: 2.80, energyKcal: -7.5 },
        { source: 'RES2', target: 'RES7', interactionType: 'covalent', distanceAngstrom: 3.40, energyKcal: -4.0 },
        { source: 'RES4', target: 'RES8', interactionType: 'h_bond', distanceAngstrom: 2.88, energyKcal: -6.1 },
      ];
    }

    return { nodes, links };
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 480;

    const { nodes: rawNodes, links: rawLinks } = getNetworkData();

    // Filter links if user selected a filter
    const filteredLinks = filterType === 'all'
      ? rawLinks
      : rawLinks.filter(l => l.interactionType === filterType);

    // Deep copy for D3 simulation
    const nodes: ResidueNode[] = JSON.parse(JSON.stringify(rawNodes));
    const links: InteractionLink[] = JSON.parse(JSON.stringify(filteredLinks));

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%').attr('height', '100%');

    // Defs: Gradients and filters for orbital electron clouds and glows
    const defs = svg.append('defs');

    // Orbital electron density radial gradient (HOMO / LUMO / Density)
    const orbitalGrad = defs.append('radialGradient')
      .attr('id', 'orbital-cloud-gradient')
      .attr('cx', '50%').attr('cy', '50%')
      .attr('r', '50%');
    orbitalGrad.append('stop').attr('offset', '0%').attr('stop-color', orbitalMode === 'homo' ? '#38bdf8' : orbitalMode === 'lumo' ? '#f43f5e' : '#a855f7').attr('stop-opacity', 0.65);
    orbitalGrad.append('stop').attr('offset', '60%').attr('stop-color', orbitalMode === 'homo' ? '#0284c7' : orbitalMode === 'lumo' ? '#be123c' : '#7e22ce').attr('stop-opacity', 0.25);
    orbitalGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0f172a').attr('stop-opacity', 0);

    // Metal ion coordination halo
    const ionGrad = defs.append('radialGradient')
      .attr('id', 'ion-halo')
      .attr('cx', '50%').attr('cy', '50%')
      .attr('r', '50%');
    ionGrad.append('stop').attr('offset', '0%').attr('stop-color', '#34d399').attr('stop-opacity', 0.8);
    ionGrad.append('stop').attr('offset', '70%').attr('stop-color', '#059669').attr('stop-opacity', 0.3);
    ionGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0f172a').attr('stop-opacity', 0);

    // Filter for neon orbital glow
    const filter = defs.append('filter').attr('id', 'neon-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Zoom container
    const g = svg.append('g').attr('class', 'main-network-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // D3 Force Simulation
    const simulation = d3
      .forceSimulation<ResidueNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<ResidueNode, InteractionLink>(links)
          .id((d) => d.id)
          .distance((d) => d.distanceAngstrom * 38)
      )
      .force('charge', d3.forceManyBody().strength(-340 * chargeScale))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(42));

    // 1. Draw Interaction Links (Bonds)
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        switch (d.interactionType) {
          case 'covalent': return '#38bdf8';
          case 'salt_bridge': return '#f43f5e';
          case 'h_bond': return '#34d399';
          case 'pi_stacking': return '#c084fc';
          case 'disulfide': return '#fbbf24';
          default: return '#94a3b8';
        }
      })
      .attr('stroke-width', (d) => (d.interactionType === 'covalent' || d.interactionType === 'disulfide' ? 3.5 : 2))
      .attr('stroke-dasharray', (d) => (d.interactionType === 'h_bond' || d.interactionType === 'salt_bridge' ? '5,5' : '0'))
      .attr('stroke-opacity', 0.85);

    // 2. Draw Molecular Orbital Electron Clouds (if enabled)
    const orbitalGroup = g.append('g').attr('class', 'orbital-clouds');
    let orbitalClouds: any = null;

    if (showOrbitalClouds) {
      orbitalClouds = orbitalGroup
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', (d) => (d.type === 'metal_ion' ? 62 : 48 * d.electronDensity))
        .attr('fill', (d) => (d.type === 'metal_ion' ? 'url(#ion-halo)' : 'url(#orbital-cloud-gradient)'))
        .attr('opacity', 0.7)
        .style('pointer-events', 'none');
    }

    // 3. Draw Residue / Atom Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, ResidueNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Core Atom Circle
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'metal_ion' ? 19 : 16))
      .attr('fill', (d) => d.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#neon-glow)');

    // Text Label inside Node
    node
      .append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#0f172a')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('font-family', 'ui-monospace, monospace');

    // External Title Label
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '28px')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // Ticker Update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      if (orbitalClouds) {
        orbitalClouds
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      }

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [uniprotId, orbitalMode, showOrbitalClouds, filterType, chargeScale]);

  return (
    <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4">
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Atom className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <span>شبكة الروابط والمدارات الجزيئية التفاعلية (D3.js Molecular Orbitals)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              البروتين: {geneName} ({uniprotId}) • محاكاة القوى الكهروستاتيكية وتداخل السحب الإلكترونية
            </span>
          </div>
        </div>

        {/* Orbital Energy Mode Pill Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-mono px-1">المدار:</span>
          {(['density', 'homo', 'lumo'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setOrbitalMode(m)}
              className={`px-2.5 py-1 rounded-lg font-mono transition ${
                orbitalMode === m
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'density' ? 'كثافة إلكترونية (Ψ²)' : m === 'homo' ? 'HOMO الأعلى إشغالاً' : 'LUMO الأدنى شواغراً'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* D3 SVG Viewport */}
        <div
          ref={containerRef}
          className="lg:col-span-3 h-[480px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner flex items-center justify-center"
        >
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Quick HUD Overlay Controls inside Canvas */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 z-10">
            <button
              onClick={() => setShowOrbitalClouds(!showOrbitalClouds)}
              className={`px-2.5 py-1 rounded-lg transition ${
                showOrbitalClouds ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}
              title="تفعيل سحب المدارات الإلكترونية"
            >
              سحب المدارات {showOrbitalClouds ? 'مفعلة' : 'مخفية'}
            </button>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="all">كافة الروابط</option>
              <option value="covalent">روابط تساهمية (Covalent)</option>
              <option value="h_bond">روابط هيدروجينية (H-Bonds)</option>
              <option value="salt_bridge">جسور ملحية (Salt Bridges)</option>
              <option value="pi_stacking">تكدس عطري (π-π Stacking)</option>
            </select>
          </div>

          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>اسحب الذرات بالماوس لتحريك المدارات • استخدم عجلة الفأرة للتكبير والتحريك (Pan & Zoom)</span>
          </div>
        </div>

        {/* Right Details Panel for Selected Residue / Orbital */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 text-xs">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
              <CircleDot className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-sm text-slate-100">تفاصيل المدار والجزيء</h4>
            </div>

            {selectedNode ? (
              <div className="space-y-3 pt-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الحمض الأميني:</span>
                  <span className="font-bold text-slate-100 font-mono text-sm">{selectedNode.name} (#{selectedNode.residueNumber})</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الشحنة الجزئية:</span>
                  <span className={`font-mono font-bold ${selectedNode.charge > 0 ? 'text-sky-400' : selectedNode.charge < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {selectedNode.charge > 0 ? `+${selectedNode.charge} e` : `${selectedNode.charge} e`}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">التهجين والمدار الجزيئي:</span>
                  <span className="font-mono text-purple-300 bg-slate-900 p-2 rounded-lg border border-slate-800 block text-[11px] leading-relaxed">
                    {selectedNode.orbitalType}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">الكثافة الإلكترونية النسبية (Ψ²):</span>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-sky-400 h-full"
                      style={{ width: `${selectedNode.electronDensity * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{(selectedNode.electronDensity * 100).toFixed(1)}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  {selectedNode.description}
                </div>
              </div>
            ) : (
              <div className="pt-6 text-center text-slate-500 space-y-2">
                <Atom className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                <p>انقر على أي ذرة أو حمض أميني في الرسم لعرض خصائص مداره الجزيئي وطاقة تفاعلاته.</p>
              </div>
            )}
          </div>

          {/* D3 Simulation Tuning */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">شدة التنافر الكهروستاتيكي:</span>
              <span className="font-mono text-purple-300 font-bold">{chargeScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={chargeScale}
              onChange={(e) => setChargeScale(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Legend for Bonds & Interactions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#38bdf8]" />
          <span className="text-slate-300">تساهمية Covalent (~80 kcal/mol)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-[#34d399]" />
          <span className="text-slate-300">هيدروجينية H-Bond (~5-7 kcal/mol)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-[#f43f5e]" />
          <span className="text-slate-300">جسر ملحي Salt Bridge (~12 kcal/mol)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#c084fc]" />
          <span className="text-slate-300">تكدس عطري π-π Stacking (~4 kcal/mol)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#fbbf24]" />
          <span className="text-slate-300">ثنائي الكبريتيد Disulfide (S-S)</span>
        </div>
      </div>
    </div>
  );
};
