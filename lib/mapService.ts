// lib/mapService.ts

import AMapLoader from '@amap/amap-jsapi-loader';

// 定义一个简单地点类型
export interface MapLocation {
  name: string;
  coordinates: [number, number]; // [经度, 纬度]
}

let mapInstance: any = null; // 用于缓存地图实例

/**
 * 初始化地图
 * @param containerId 地图容器的 DOM 元素 ID
 * @param center 地图中心点 [经度, 纬度]
 * @param zoom 地图缩放级别
 * @returns 返回地图实例的 Promise
 */
export const initializeMap = async (containerId: string, center: [number, number] = [116.397428, 39.90923], zoom: number = 11): Promise<any> => {
  try {
    const AMap = await AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY!, // 确保你的 .env.local 中有这个 key
      version: '2.0',
      plugins: ['AMap.Marker'], // 需要用到的插件，这里预加载点标记插件
    });
    
    // ！！高德地图2.0安全密钥，需要在高德开放平台控制台创建并设置
    // (window as any)._AMapSecurityConfig = {
    //   securityJsCode: '你的安全密钥',
    // };

    mapInstance = new AMap.Map(containerId, {
      zoom: zoom,
      center: center,
      viewMode: '3D',
    });

    return mapInstance;
  } catch (e) {
    console.error("高德地图加载失败:", e);
    throw e;
  }
};

/**
 * 在地图上批量添加标记点
 * @param locations 一个包含名称和经纬度的地点数组
 */
export const addMarkersToMap = (locations: MapLocation[]) => {
  if (!mapInstance) {
    console.warn("地图实例尚未初始化。");
    return;
  }

  // 先清除地图上已有的标记点
  mapInstance.clearMap();

  const markers = locations.map(loc => {
    return new (window as any).AMap.Marker({
      position: loc.coordinates,
      title: loc.name,
    });
  });

  mapInstance.add(markers);

  // 自动缩放到能显示所有标记点的最佳视野
  if (markers.length > 0) {
    mapInstance.setFitView();
  }
};

/**
 * 获取当前地图实例
 */
export const getMapInstance = () => {
  return mapInstance;
};