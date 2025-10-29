// lib/mapService.ts (State 管理版)
import AMapLoader from '@amap/amap-jsapi-loader';

export interface MapLocation {
  name: string;
  coordinates: [number, number];
}

// 1. 不再需要模块级的 mapInstance 变量
// let mapInstance: any = null; 

/**
 * 创建并返回一个新的地图实例。
 */
export const createMap = async (containerId: string): Promise<any> => {
  try {
    const AMap = await AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY!,
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polyline'], 
    });
    
    const map = new AMap.Map(containerId, {
      zoom: 11,
      viewMode: '3D',
    });
    
    console.log("mapService: 新的地图实例已创建");
    return map; // 2. 直接返回新创建的实例

  } catch (e) {
    console.error("高德地图加载失败:", e);
    throw e;
  }
};

/**
 * 在给定的地图实例上绘制路径和标记点。
 * @param mapInstance - 要操作的地图实例。
 * @param locations - 地点数组。
 */
export const drawPathAndMarkers = (mapInstance: any, locations: MapLocation[]) => {
  // 3. 函数现在接收 mapInstance 作为第一个参数
  if (!mapInstance) {
    console.warn("drawPathAndMarkers: 传入的地图实例无效。");
    return;
  }

  mapInstance.clearMap();
  if (!locations || locations.length === 0) return;

  const path = locations.map(loc => loc.coordinates);
  const markers = locations.map(loc => {
    return new (window as any).AMap.Marker({
      position: loc.coordinates,
      title: loc.name,
    });
  });
  mapInstance.add(markers);

  if (path.length > 1) {
    const polyline = new (window as any).AMap.Polyline({
      path: path,
      strokeWeight: 3,
      strokeColor: '#4A90E2',
      lineJoin: 'round',
    });
    mapInstance.add(polyline);
  }
  
  console.log("mapService: 正在重绘地图并调整视野...");
  mapInstance.setFitView();
};