import * as React from 'react';
import * as classNames from 'classnames';
import { Edge, Layer, useHover, EdgeConnectorArrow, observer } from '@console/topology';

type AggregateEdgeProps = {
  element: Edge;
};

const AggregateEdge: React.FC<AggregateEdgeProps> = ({ element }) => {
  const [hover, hoverRef] = useHover();
  const startPoint = element.getStartPoint();
  const endPoint = element.getEndPoint();

  return (
    <Layer id={hover ? 'top' : undefined}>
      <g
        ref={hoverRef}
        data-test-id="edge-handler"
        className={classNames('odc-connects-to odc-base-edge', {
          'is-hover': hover,
        })}
      >
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          strokeWidth={10}
          stroke="transparent"
        />
        <line
          className="odc-base-edge__link"
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
        />
        {(!element.getSource().isCollapsed() || !element.getTarget().isCollapsed()) && (
          <EdgeConnectorArrow edge={element} />
        )}
      </g>
    </Layer>
  );
};

export default observer(AggregateEdge);
