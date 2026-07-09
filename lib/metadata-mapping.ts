/**
 * 映射表：端点标识 → JSON 文件名（位于 /metadata 目录下）
 * 修改此表即可增加或调整元数据源
 */
export const metadataMapping = {
  default: 'service-info.json',
  service: 'service-info.json',
  another: 'another.json',
  // 可继续扩展
} as const;

export type MetadataType = keyof typeof metadataMapping;