// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 GET /equipmentTypes/list */
export async function getEquipmentTypes(options?: { [key: string]: any }) {
  return request<API.BaseResponseStringArray>("/equipmentTypes/list", {
    method: "GET",
    ...(options || {}),
  });
}
