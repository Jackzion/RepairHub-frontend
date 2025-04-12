// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 PUT /notification/create */
export async function createNotification(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createNotificationParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/notification/create", {
    method: "PUT",
    params: {
      ...params,
      notificationRequest: undefined,
      ...params["notificationRequest"],
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /notification/delete */
export async function deleteNotification(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteNotificationParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/notification/delete", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /notification/deleteAll */
export async function deleteAll(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/notification/deleteAll", {
    method: "PUT",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /notification/myList */
export async function getMyList(options?: { [key: string]: any }) {
  return request<API.BaseResponseListNotifications>("/notification/myList", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /notification/read */
export async function setRead(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setReadParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/notification/read", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /notification/readAll */
export async function setReadAll(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/notification/readAll", {
    method: "PUT",
    ...(options || {}),
  });
}
