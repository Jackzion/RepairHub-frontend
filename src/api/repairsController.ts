// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

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

/** 此处后端没有提供注释 GET /repairs/cancelPendingRepair */
export async function cancelPendingRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelPendingRepairParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/repairs/cancelPendingRepair", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/force-close */
export async function forceCloseRepair(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.forceCloseRepairParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/repairs/force-close", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /repairs/get */
export async function getRepairsById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRepairsByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairs>("/repairs/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /repairs/getRepairRatingVo */
export async function getRepairRatingVo(options?: { [key: string]: any }) {
  return request<API.BaseResponseListRepairRatingVo>(
    "/repairs/getRepairRatingVo",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /repairs/getRepairRecord */
export async function getRepairRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRepairRecordParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairRecords>("/repairs/getRepairRecord", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /repairs/getUserRepairs */
export async function getUserRepairs1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserRepairs1Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairsResVo>("/repairs/getUserRepairs", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/priority */
export async function updatePriority(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updatePriorityParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairs>("/repairs/priority", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /repairs/status/update */
export async function updateRepairStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateRepairStatusParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRepairs>("/repairs/status/update", {
    method: "PUT",
    params: {
      ...params,
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
