// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 PUT /rating/add */
export async function addRating(
  body: API.AddRatingRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/rating/add", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /rating/exist */
export async function isExistRating(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.isExistRatingParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/rating/exist", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /rating/statistics */
export async function getRatingStatistics(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRatingStatisticsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRatingResVo>("/rating/statistics", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
