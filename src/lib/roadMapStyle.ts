import type { StyleSpecification } from 'maplibre-gl';

const ROAD_LAYER_ID = /^(?:highway_|road_|tunnel_motorway)/;
const ATTRIBUTION =
  '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

export function roadOnlyMapStyle(
  style: StyleSpecification,
): StyleSpecification {
  const layers = style.layers.filter(
    (layer) =>
      layer.type === 'background' ||
      ('source-layer' in layer &&
        layer['source-layer'] === 'transportation' &&
        ROAD_LAYER_ID.test(layer.id)),
  );
  const usedSources = new Set(
    layers.flatMap((layer) => ('source' in layer ? [layer.source] : [])),
  );
  const sources = Object.fromEntries(
    Object.entries(style.sources)
      .filter(([id]) => usedSources.has(id))
      .map(([id, source]) => [
        id,
        id === 'openmaptiles'
          ? { ...source, attribution: ATTRIBUTION }
          : source,
      ]),
  );

  return { ...style, sources, layers, sprite: undefined, glyphs: undefined };
}
