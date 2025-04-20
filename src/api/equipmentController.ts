// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 PUT /equipment/add */
export async function addEquipment(
  body: API.EquipmentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/equipment/add", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /equipment/delete */
export async function deleteEquipments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteEquipmentsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/equipment/delete", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /equipment/list */
export async function listEquipments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listEquipmentsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListEquipments>("/equipment/list", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /equipment/update */
export async function updateEquipments(
  body: API.EquipmentUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/equipment/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
