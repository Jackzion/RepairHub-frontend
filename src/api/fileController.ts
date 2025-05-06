// @ts-ignore
/* eslint-disable */
import request from "@/axioss/request";

/** 此处后端没有提供注释 GET /file/test/download */
export async function testDownloadFile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.testDownloadFileParams,
  options?: { [key: string]: any }
) {
  return request<any>("/file/test/download", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 上传测试接口（后端需要补上这个路由） */
export async function testUpload(
  formData: FormData, // 改为接收FormData
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/file/test/upload', {
    method: 'POST',
    // 删除手动设置的Content-Type，让浏览器自动生成
    headers: {
      ...(options?.headers || {}),
    },
    data: formData, // 直接传递FormData对象
    ...(options || {}),
  });
}
