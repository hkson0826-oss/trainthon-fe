'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import { env } from '@/lib/env';
import type { MapBounds, MapIncident } from '@/types/api';

type Point = { lat: number; lng: number };
const EMPTY: MapIncident[] = [];

export function IncidentMap({ items = EMPTY, selected, onSelect, onBoundsChange, focus }: {
  items?: MapIncident[];
  selected?: Point | null;
  onSelect?: (point: Point) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  focus?: Point | null;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layers = useRef<LayerGroup | null>(null);
  const callbacks = useRef({ onSelect, onBoundsChange });
  callbacks.current = { onSelect, onBoundsChange };
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    setError('');
    void import('leaflet').then((L) => {
      if (disposed || !container.current) return;
      const m = L.map(container.current, { minZoom: 3, maxZoom: 19, maxBounds: [[-85, -180], [85, 180]], maxBoundsViscosity: 1 }).setView([37.5665, 126.978], 12);
      map.current = m;
      layers.current = L.layerGroup().addTo(m);
      L.tileLayer(env.mapTileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).on('tileerror', () => setError('지도 배경을 불러오지 못했습니다. 연결을 확인하거나 아래 목록을 이용해 주세요.')).addTo(m);
      m.on('click', (event) => callbacks.current.onSelect?.({ lat: event.latlng.lat, lng: event.latlng.wrap().lng }));
      const reportBounds = () => {
        const b = m.getBounds();
        callbacks.current.onBoundsChange?.({ south: Math.max(-90, b.getSouth()), north: Math.min(90, b.getNorth()), west: Math.max(-180, b.getWest()), east: Math.min(180, b.getEast()) });
      };
      m.on('moveend', reportBounds);
      reportBounds();
      resize = new ResizeObserver(() => m.invalidateSize());
      resize.observe(container.current);
      setReady(true);
    }).catch(() => setError('지도를 불러오지 못했습니다. 다시 시도해 주세요.'));
    return () => { disposed = true; resize?.disconnect(); map.current?.remove(); map.current = null; layers.current = null; setReady(false); };
  }, [retry]);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    void import('leaflet').then((L) => {
      if (disposed || !layers.current) return;
      layers.current.clearLayers();
      const markerIcon = L.divIcon({ className: 'incident-map-pin', html: '<span aria-hidden="true"></span>', iconSize: [28, 36], iconAnchor: [14, 36] });
      for (const item of items) {
        if (item.place.lat === null || item.place.lng === null) continue;
        const popup = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.place.name;
        const link = document.createElement('a');
        link.href = `/incidents/${encodeURIComponent(item.id)}`;
        link.textContent = '신고 상세 보기 →';
        link.className = 'map-detail-link';
        popup.append(title, document.createElement('br'), link);
        L.marker([item.place.lat, item.place.lng], { icon: markerIcon, title: item.place.name }).bindPopup(popup).addTo(layers.current);
      }
      if (selected) L.marker([selected.lat, selected.lng], { icon: markerIcon, title: '선택한 사고 위치' }).addTo(layers.current);
    });
    return () => { disposed = true; };
  }, [items, selected, ready]);

  useEffect(() => {
    if (ready && focus) map.current?.setView([focus.lat, focus.lng], 16);
  }, [focus, ready]);

  return <div className="map-frame">
    <div ref={container} className="incident-map" role="region" aria-label={onSelect ? '사고 위치 선택 지도' : '신고 지도'} />
    {!ready && !error ? <p className="typo-sm map-loading" role="status">지도를 불러오는 중…</p> : null}
    {error ? <div className="map-error" role="alert"><p>{error}</p><button type="button" className="btn btn-secondary" onClick={() => setRetry((n) => n + 1)}>지도 다시 불러오기</button></div> : null}
  </div>;
}
