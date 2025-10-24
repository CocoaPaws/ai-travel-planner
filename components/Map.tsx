// components/Map.tsx
'use client';

import { useEffect, useRef } from 'react';
import { initializeMap, addMarkersToMap, MapLocation } from '@/lib/mapService';
import styles from './Map.module.css'; // 导入样式

interface MapProps {
  locations: MapLocation[];
}

export default function Map({ locations }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 初始化地图
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后仍然执行
    if (mapContainerRef.current) {
      initializeMap(mapContainerRef.current.id).catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // 更新地图标记点
  useEffect(() => {
    if (locations.length > 0) {
      addMarkersToMap(locations);
    }
  }, [locations]);

  return (
    // 使用 wrapper div 来确保尺寸
    <div 
      id="map-container"
      ref={mapContainerRef} 
      className={styles.mapWrapper} // 应用撑满容器的样式
    />
  );
}