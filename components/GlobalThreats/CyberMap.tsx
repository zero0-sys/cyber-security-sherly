import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import { AttackEvent } from './types';
import { COLORS, NODES } from './constants';

interface CyberMapProps {
    attacks: AttackEvent[];
}

const CyberMap: React.FC<CyberMapProps> = ({ attacks }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false,
            center: [25, 10],
            zoom: 2.5,
            minZoom: 2,
            maxZoom: 6,
            worldCopyJump: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Force background to black to hide white grid lines
        map.getContainer().style.background = '#050505';

        const svg = d3.select(map.getPanes().overlayPane).append("svg");
        const g = svg.append("g").attr("class", "leaflet-zoom-hide");

        overlayRef.current = svg;
        mapRef.current = map;

        const drawLabels = () => {
            g.selectAll(".node-label").remove();
            g.selectAll(".node-point").remove();

            NODES.forEach(node => {
                const point = map.latLngToLayerPoint([node.lat, node.lng]);

                g.append("circle")
                    .attr("class", "node-point")
                    .attr("cx", point.x)
                    .attr("cy", point.y)
                    .attr("r", 4)
                    .attr("fill", "rgba(234, 179, 8, 0.3)")
                    .attr("stroke", "none");

                g.append("circle")
                    .attr("class", "node-point")
                    .attr("cx", point.x)
                    .attr("cy", point.y)
                    .attr("r", 1.5)
                    .attr("fill", "#fbbf24");

                g.append("text")
                    .attr("class", "node-label")
                    .attr("x", point.x)
                    .attr("y", point.y - 8)
                    .text(node.name)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#9ca3af")
                    .attr("font-size", "9px")
                    .attr("font-family", "'Share Tech Mono', monospace")
                    .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");
            });
        };

        const reset = () => {
            const bounds = map.getBounds();
            const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
            const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

            svg.attr("width", Math.abs(bottomRight.x - topLeft.x) + 100)
                .attr("height", Math.abs(bottomRight.y - topLeft.y) + 100)
                .style("left", `${topLeft.x - 50}px`)
                .style("top", `${topLeft.y - 50}px`);

            g.attr("transform", `translate(${-topLeft.x + 50}, ${-topLeft.y + 50})`);

            drawLabels();
        };

        map.on("moveend", reset);
        reset();

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Handle Attacks Rendering using D3
    useEffect(() => {
        if (!mapRef.current || !overlayRef.current) return;

        const map = mapRef.current;
        const g = overlayRef.current.select("g");

        const selection = g.selectAll<SVGPathElement, AttackEvent>(".attack-path")
            .data(attacks, (d) => d.id);

        selection.exit().remove();

        selection.enter()
            .append("path")
            .attr("class", "attack-path")
            .each(function (d) {
                const source = map.latLngToLayerPoint([d.source.lat, d.source.lng]);
                const target = map.latLngToLayerPoint([d.target.lat, d.target.lng]);

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const dr = dist * 1.5;

                const pathData = `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
                const color = COLORS[d.type];

                const el = d3.select(this);
                el.attr("d", pathData)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", 2)
                    .attr("stroke-linecap", "round")
                    .style("filter", `drop-shadow(0 0 2px ${color})`);

                const totalLength = (this as SVGPathElement).getTotalLength() || 0;

                el.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1200 + Math.random() * 800)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0)
                    .on("end", function () {
                        g.append("circle")
                            .attr("cx", target.x)
                            .attr("cy", target.y)
                            .attr("r", 1)
                            .attr("stroke", color)
                            .attr("stroke-width", 1.5)
                            .attr("fill", "none")
                            .transition()
                            .duration(600)
                            .attr("r", 20)
                            .style("opacity", 0)
                            .remove();

                        d3.select(this)
                            .transition()
                            .duration(500)
                            .style("opacity", 0)
                            .remove();
                    });
            });

    }, [attacks]);

    return (
        <div className="w-full h-full absolute top-0 left-0 bg-[#050505] z-0">
            <div ref={containerRef} className="w-full h-full outline-none" />
            {/* Vignette Overlay for cinematic look */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] z-[5]"></div>
        </div>
    );
};

export default CyberMap;
