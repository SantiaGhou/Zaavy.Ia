import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export function ConnectionLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeColor = () => {
    if (data?.condition === 'true') return '#10b981'; // green
    if (data?.condition === 'false') return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getEdgeLabel = () => {
    if (data?.condition === 'true') return 'Sim';
    if (data?.condition === 'false') return 'Não';
    return data?.label || '';
  };

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: getEdgeColor(),
          strokeWidth: 2,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        {getEdgeLabel() && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 text-xs font-medium"
          >
            {getEdgeLabel()}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}