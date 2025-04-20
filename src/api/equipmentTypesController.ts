// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 PUT /equipmentTypes/add */
export async function addEquipmentTypes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addEquipmentTypesParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/equipmentTypes/add", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /equipmentTypes/list */
export async function getEquipmentTypes(options?: { [key: string]: any }) {
  return request<API.BaseResponseStringArray>("/equipmentTypes/list", {
    method: "GET",
    ...(options || {}),
  });
}
