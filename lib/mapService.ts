// lib/mapService.ts (JScode 配置版)

import AMapLoader from '@amap/amap-jsapi-loader';

// 定义地点的数据结构
export interface MapLocation {
  name: string;
  coordinates: [number, number]; // 格式: [经度, 纬度]
}

/**
 * 创建并返回一个新的高德地图实例。
 * 这个函数会从环境变量中读取并配置安全密钥 JScode。
 * @param containerId - 地图容器的 DOM 元素 ID。
 * @returns 返回地图实例的 Promise。
 */
export const createMap = async (containerId: string): Promise<any> => {
  try {
    // 1. 加载高德地图 JSAPI 核心脚本
    const AMap = await AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY!, // 从环境变量读取 API Key
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polyline'], // 加载所有需要的插件
    });
    
    // 2. 从环境变量中读取 JScode
    const jscode = process.env.NEXT_PUBLIC_AMAP_JSCODE;

    // 3. 只有当 JScode 存在时，才进行安全配置
    //    这是高德 JSAPI 2.0 的标准安全要求
    if (jscode) {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: jscode,
      };
      console.log("mapService: 已配置高德地图安全密钥 JScode。");
    } else {
      console.warn("mapService: 未在环境变量中找到 NEXT_PUBLIC_AMAP_JSCODE，地图可能无法加载。");
    }

    // 4. 创建并返回地图实例
    const map = new AMap.Map(containerId, {
      zoom: 11,
      viewMode: '3D',
    });
    
    console.log("mapService: 新的地图实例已创建");
    return map;

  } catch (e) {
    console.error("高德地图加载或初始化失败:", e);
    throw e;
  }
};

/**
 * 在给定的地图实例上绘制路径和标记点。
 * 此函数会先清空地图上的所有覆盖物。
 * @param mapInstance - 要操作的地图实例。
 * @param locations - 地点数组。
 */
export const drawPathAndMarkers = (mapInstance: any, locations: MapLocation[]) => {
  if (!mapInstance) {
    console.warn("drawPathAndMarkers: 传入的地图实例无效，无法绘制。");
    return;
  }

  // 清空地图
  mapInstance.clearMap();

  if (!locations || locations.length === 0) {
    return; // 如果没有地点，直接返回
  }

  // 准备数据
  const path = locations.map(loc => loc.coordinates);
  
  // 创建标记点
  const markers = locations.map(loc => {
    return new (window as any).AMap.Marker({
      position: loc.coordinates,
      title: loc.name,
    });
  });
  mapInstance.add(markers);

  // 如果有多个点，创建路线
  if (path.length > 1) {
    const polyline = new (window as any).AMap.Polyline({
      path: path,
      strokeWeight: 3,
      strokeColor: '#4A90E2',
      lineJoin: 'round',
    });
    mapInstance.add(polyline);
  }
  
  // 自动调整视野
  console.log("mapService: 正在重绘地图标记和路径...");
  mapInstance.setFitView();
};