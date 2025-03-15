// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 PUT /repair-records/${param0} */
export async function updateRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateRecordParams,
  body: Record<string, any>,
  options?: { [key: string]: any }
) {
  const { recordId: param0, ...queryParams } = params;
  return request<API.BaseResponseRepairRecords>(`/repair-records/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      ...queryParams,
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /repair-records/${param0} */
export async function deleteRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRecordParams,
  options?: { [key: string]: any }
) {
  const { recordId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(`/repair-records/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /repair-records/${param0} */
export async function getRepairRecords(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRepairRecordsParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseIPageRepairRecords>(
    `/repair-records/${param0}`,
    {
      method: "GET",
      params: {
        // current has a default value: 1
        current: "1",
        // size has a default value: 10
        size: "10",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /repair-records/${param0} */
export async function addRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addRecordParams,
  body: Record<string, any>,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseRepairRecords>(`/repair-records/${param0}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      ...queryParams,
    },
    data: body,
    ...(options || {}),
  });
}
