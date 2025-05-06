// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 GET /syslog/page */
export async function getSystemLogPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSystemLogPageParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseIPageSystemLogs>("/syslog/page", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
