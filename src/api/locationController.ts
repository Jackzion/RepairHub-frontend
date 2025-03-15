// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 GET /locations/all */
export async function getAllLocations(options?: { [key: string]: any }) {
  return request<API.BaseResponseListLocations>("/locations/all", {
    method: "GET",
    ...(options || {}),
  });
}
