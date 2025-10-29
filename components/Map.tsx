// components/Map.tsx (State 管理版)
'use client';

import React, { useEffect, useRef, useState } from 'react';
// 1. 导入新的 createMap 函数
import { createMap, drawPathAndMarkers, MapLocation } from '@/lib/mapService';
import styles from './Map.module.css';

interface MapProps {
  locations: MapLocation[];
}

export default function Map({ locations }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // 2. 使用 useState 来持有地图实例
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Effect 1: 只负责创建地图实例，并且只运行一次
  useEffect(() => {
    let map: any; // 临时变量
    if (mapContainerRef.current) {
      console.log("Map.tsx: 正在创建地图实例...");
      createMap(mapContainerRef.current.id)
        .then(newMapInstance => {
          map = newMapInstance;
          setMapInstance(newMapInstance); // 3. 将创建好的实例存入 state
        })
        .catch(console.error);
    }
    
    // 组件卸载时销毁地图，释放资源
    return () => {
      if (map) {
        console.log("Map.tsx: 正在销毁地图实例...");
        map.destroy();
      }
    };
  }, []); // 空依赖数组确保只运行一次

  // Effect 2: 负责绘制，依赖于地图实例和 locations 数据
  useEffect(() => {
    console.log("Map.tsx: 绘制 Effect 被触发。");
    // 4. 只有在地图实例存在时，才执行绘制
    if (mapInstance) {
      console.log("Map.tsx: 地图实例存在，正在调用 drawPathAndMarkers...", locations);
      drawPathAndMarkers(mapInstance, locations);
    } else {
      console.log("Map.tsx: 绘制 Effect 被触发，但地图实例尚未准备好。");
    }
  }, [mapInstance, locations]); // 5. 依赖于 mapInstance 和 locations

  return (
    <div 
      id="map-container"
      ref={mapContainerRef} 
      className={styles.mapWrapper}
    />
  );
}