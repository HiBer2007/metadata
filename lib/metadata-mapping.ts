/**
 * 映射表：端点标识 → JSON 文件名（位于 /metadata 目录下）
 * 修改此表即可增加或调整元数据源
 */
export const metadataMapping = {
  default: 'service_list.json',
  service: 'service_list.json',
  flfhmcl: 'FLFHMCL.json',
  flfHBNsso: 'FLF-HBNET-SSO-mod.json',
  flftitle: 'flftitle.json',
  ssobridge: 'SSO_Bridge.json',
  // 可继续扩展
} as const;

export type MetadataType = keyof typeof metadataMapping;