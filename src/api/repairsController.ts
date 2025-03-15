// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 DELETE /repairs/${param0} */
export async function cancelRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelRepairParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(`/repairs/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/${param0}/accept */
export async function acceptRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.acceptRepairParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseRepairs>(`/repairs/${param0}/accept`, {
    method: "PUT",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/${param0}/assign/${param1} */
export async function assignRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.assignRepairParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, maintainerId: param1, ...queryParams } = params;
  return request<API.BaseResponseRepairs>(
    `/repairs/${param0}/assign/${param1}`,
    {
      method: "PUT",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 PUT /repairs/${param0}/complete */
export async function completeRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.completeRepairParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseRepairs>(`/repairs/${param0}/complete`, {
    method: "PUT",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/${param0}/force-close */
export async function forceCloseRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.forceCloseRepairParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(`/repairs/${param0}/force-close`, {
    method: "PUT",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/${param0}/priority */
export async function updatePriority(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updatePriorityParams,
  options?: { [key: string]: any }
) {
  const { repairId: param0, ...queryParams } = params;
  return request<API.BaseResponseRepairs>(`/repairs/${param0}/priority`, {
    method: "PUT",
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /repairs/submit */
export async function submitRepair(
  body: API.RepairsSubmitRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairs>("/repairs/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /repairs/user */
export async function getUserRepairs(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserRepairsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseIPageRepairs>("/repairs/user", {
    method: "GET",
    params: {
      // current has a default value: 1
      current: "1",
      // size has a default value: 10
      size: "10",
      ...params,
    },
    ...(options || {}),
  });
}
