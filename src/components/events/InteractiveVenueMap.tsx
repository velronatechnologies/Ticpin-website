'use client';

import { useMemo } from 'react';

export default function InteractiveVenueMap({ 
    layoutJson, 
    selectedSectionName, 
    onSelectSection,
    getZonePrice,
    getZoneQuantity,
    getZoneStyle,
    zoneStyles
}: {
    layoutJson: string;
    selectedSectionName: string | null;
    onSelectSection: (name: string) => void;
    getZonePrice: (name: string) => string;
    getZoneQuantity: (name: string) => number;
    getZoneStyle?: (zoneKey: string, baseStyle: any) => any;
    zoneStyles?: any;
}) {
    const layout = useMemo(() => {
        try {
            return JSON.parse(layoutJson);
        } catch {
            return null;
        }
    }, [layoutJson]);

    if (!layout || !layout.elements) return null;

    // Calculate bounding box of all elements to set the viewBox dynamically
    const bounds = layout.elements.reduce(
        (acc: any, el: any) => {
            const x = el.x ?? 0;
            const y = el.y ?? 0;
            const w = el.width ?? (el.radius !== undefined ? el.radius * 2 : 100);
            const h = el.height ?? (el.radius !== undefined ? el.radius * 2 : 100);
            return {
                minX: Math.min(acc.minX, x),
                minY: Math.min(acc.minY, y),
                maxX: Math.max(acc.maxX, x + w),
                maxY: Math.max(acc.maxY, y + h),
            };
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const padding = 10;
    const minX = bounds.minX === Infinity ? 0 : bounds.minX - padding;
    const minY = bounds.minY === Infinity ? 0 : bounds.minY - padding;
    const maxX = bounds.maxX === -Infinity ? 800 : bounds.maxX + padding;
    const maxY = bounds.maxY === -Infinity ? 600 : bounds.maxY + padding;
    const width = maxX - minX;
    const height = maxY - minY;

    return (
        <div className="w-full flex items-center justify-center p-0">
            <div className="w-full flex justify-center">
                <svg 
                    viewBox={`${minX} ${minY} ${width} ${height}`} 
                    className="w-auto h-full max-h-[calc(100vh-270px)] md:max-h-[calc(100vh-230px)] max-w-full bg-white select-none block"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {layout.elements.map((el: any, i: number) => {
                        const isSelected = selectedSectionName?.toUpperCase() === el.name?.toUpperCase();
                        
                        if (el.type === 'section') {
                            const isRamp = el.name?.toUpperCase() === 'RAMP';
                            const price = isRamp ? '' : getZonePrice(el.name);
                            const qty = isRamp ? 0 : getZoneQuantity(el.name);
                            const priceOrQtyText = qty > 0 ? `${qty} Selected` : price;

                            const isSitting = el.sectionType === 'class' && (el.seatingType === 'sitting' || el.icon === 'sitting');
                            
                            const scaleFactor = (el.height || 110) / 110;

                            const nameFontSize = el.fontSize && el.fontSize !== 14 && el.fontSize !== 12
                                ? el.fontSize 
                                : Math.max(12, Math.round(32 * scaleFactor));
                                
                            const priceFontSize = el.priceSize && el.priceSize !== 12 && el.priceSize !== 10
                                ? el.priceSize 
                                : Math.max(10, Math.round(22 * scaleFactor));
                                
                            const iconSize = el.iconScale && el.iconScale !== 22
                                ? el.iconScale 
                                : Math.max(12, Math.round(24 * scaleFactor));

                            const gap = isSitting ? Math.max(2, Math.round(4 * scaleFactor)) : Math.max(3, Math.round(6 * scaleFactor));

                            // Find the corresponding zoneStyle
                            const getElementBaseStyle = (name: string) => {
                                if (!zoneStyles) return null;
                                const upper = name.toUpperCase();
                                if (upper.includes("FANPIT")) return zoneStyles.FANPIT;
                                if (upper.includes("STAGE")) return zoneStyles.STAGE;
                                if (upper.includes("RAMP")) return zoneStyles.RAMP;
                                if (upper.includes("MIP")) return zoneStyles.MIP;
                                if (upper.includes("VIP")) return zoneStyles.VIP;
                                if (upper.includes("PLATINUM")) return zoneStyles.PLATINUM;
                                if (upper.includes("GOLD")) return zoneStyles.GOLD;
                                return null;
                            };

                            const baseStyle = getElementBaseStyle(el.name);
                            const appliedStyle = (getZoneStyle && baseStyle) 
                                ? getZoneStyle(el.name, baseStyle)
                                : null;

                            const fill = appliedStyle?.backgroundColor || (el.color || '#F5F5F5');
                            const stroke = appliedStyle?.borderColor || (el.borderColor || '#D0D0D0');
                            const strokeWidth = 2;
                            const textColor = appliedStyle?.color || (el.textColor || '#1A1A1A');
                            const iconColor = appliedStyle?.color || (el.iconColor || el.borderColor || '#1A1A1A');

                            // Compute y offsets inside the box
                            let nameY = 0;
                            let iconY = 0;
                            let priceY = 0;

                            if (isSitting) {
                                const sittingContentH = nameFontSize + gap + iconSize + gap + priceFontSize;
                                const sittingStartY = (el.height - sittingContentH) / 2;
                                nameY = sittingStartY + nameFontSize / 2;
                                iconY = sittingStartY + nameFontSize + gap;
                                priceY = iconY + iconSize + gap + priceFontSize / 2;
                            } else {
                                const standingContentH = nameFontSize + gap + priceFontSize;
                                const standingStartY = (el.height - standingContentH) / 2;
                                nameY = standingStartY + nameFontSize / 2;
                                priceY = nameY + nameFontSize / 2 + gap + priceFontSize / 2;
                            }

                            return (
                                <g 
                                    key={i} 
                                    onClick={isRamp ? undefined : () => onSelectSection(el.name)}
                                    className={isRamp ? "pointer-events-none select-none" : "cursor-pointer transition-all duration-200 hover:opacity-80"}
                                >
                                    <rect
                                        x={el.x}
                                        y={el.y}
                                        width={el.width}
                                        height={el.height}
                                        rx={10}
                                        fill={fill}
                                        stroke={stroke}
                                        strokeWidth={strokeWidth}
                                    />
                                    <text
                                        x={el.x + el.width / 2}
                                        y={el.y + nameY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={textColor}
                                        fontFamily="'Anek Latin', sans-serif"
                                        fontSize={nameFontSize}
                                        fontWeight="600"
                                        className="select-none pointer-events-none uppercase tracking-tight"
                                    >
                                        {el.name}
                                    </text>

                                    {isSitting && (
                                        <g
                                            transform={`translate(${el.x + (el.width - iconSize) / 2}, ${el.y + iconY}) scale(${iconSize / 24})`}
                                            className="pointer-events-none select-none"
                                        >
                                            <rect x={4} y={4} width={16} height={10} rx={2} fill={iconColor} opacity={0.8} />
                                            <rect x={4} y={14} width={4} height={6} rx={1} fill={iconColor} />
                                            <rect x={16} y={14} width={4} height={6} rx={1} fill={iconColor} />
                                            <rect x={2} y={12} width={20} height={3} rx={1.5} fill={iconColor} />
                                        </g>
                                    )}

                                    <text
                                        x={el.x + el.width / 2}
                                        y={el.y + priceY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={textColor}
                                        fontFamily="'Anek Latin', sans-serif"
                                        fontSize={priceFontSize}
                                        fontWeight="400"
                                        className="select-none pointer-events-none"
                                    >
                                        {priceOrQtyText}
                                    </text>
                                </g>
                            );
                        }

                        if (el.type === 'stage') {
                            return (
                                <g key={i}>
                                    <rect
                                        x={el.x}
                                        y={el.y}
                                        width={el.width}
                                        height={el.height}
                                        rx={8}
                                        fill="#E8E8E8"
                                        stroke="#999999"
                                        strokeWidth={2}
                                    />
                                    <text
                                        x={el.x + el.width / 2}
                                        y={el.y + el.height / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#666666"
                                        fontFamily="'Anek Latin', sans-serif"
                                        fontSize={24}
                                        fontWeight="900"
                                        className="select-none pointer-events-none tracking-widest"
                                    >
                                        STAGE
                                    </text>
                                </g>
                            );
                        }

                        if (el.type === 'text') {
                            return (
                                <text
                                    key={i}
                                    x={el.x}
                                    y={el.y}
                                    fill={el.textColor || '#333333'}
                                    fontSize={el.fontSize || 14}
                                    fontFamily="'Anek Latin', sans-serif"
                                    fontWeight="600"
                                    className="select-none pointer-events-none"
                                >
                                    {el.text}
                                </text>
                            );
                        }

                        if (el.type === 'rect') {
                            return (
                                <rect
                                    key={i}
                                    x={el.x}
                                    y={el.y}
                                    width={el.width}
                                    height={el.height}
                                    fill={el.color || '#F5F5F5'}
                                    stroke={el.borderColor || '#D0D0D0'}
                                    strokeWidth={2}
                                    rx={6}
                                />
                            );
                        }

                        return null;
                    })}
                </svg>
            </div>
        </div>
    );
}