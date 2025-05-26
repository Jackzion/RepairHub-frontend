<template>
  <div class="new-repair-container">
    <el-card class="new-repair-card">
      <template #header>
        <div class="page-header">
          <el-page-header @back="router.back()" title="返回" :content="'新建报修'" />
        </div>
      </template>

      <el-form
        ref="repairFormRef"
        :model="repairForm"
        :rules="repairRules"
        label-position="top"
      >
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="repairForm.type" placeholder="请选择设备类型" class="w-full">
            <el-option
              v-for="option in equipmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="位置信息" prop="location">
          <el-cascader
            v-model="repairForm.location"
            :options="locationOptions"
            :props="{
              expandTrigger: 'hover',
              value: 'value',
              label: 'label',
              children: 'children'
            }"
            placeholder="请选择位置"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="详细位置" prop="locationDetail">
          <el-input
            v-model="repairForm.locationDetail"
            placeholder="请输入详细位置，如：3楼东侧走廊"
          />
        </el-form-item>

        <el-form-item label="紧急程度" prop="priority">
          <el-radio-group v-model="repairForm.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="high">高</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="repairForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述问题，以便维修人员更好地了解情况"
          />
        </el-form-item>

        <el-form-item label="图片上传">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 格式图片，单个文件不超过 2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <div class="form-actions">
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交报修
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
import { getAllLocations } from '../api/locationController';
import { getEquipmentTypes } from '../api/equipmentTypesController';
import { useLoginUserStore } from '../stores/user';
import { submitRepair } from '../api/repairsController';
import { testUpload } from '../api/fileController';

const router = useRouter();
const repairFormRef = ref();
const loading = ref(false);
const fileList = ref<UploadFile[]>([]);
const uploadedImages = ref<string[]>([]);
const userSotre = useLoginUserStore();

const repairForm = reactive<API.RepairsSubmitRequest>({
  type: '',
  location: [],
  locationDetail: '',
  priority: 'midum',
  description: '',
  creatorId: userSotre.loginUser?.id,
});

const handleFileChange = async (uploadFile: UploadFile) => {
  const isImage = uploadFile.raw?.type.startsWith('image/');
  const isLt2M = uploadFile.raw?.size ? uploadFile.raw.size / 1024 / 1024 < 2 : false;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }

  if (uploadFile.raw) {
    try {
      loading.value = true;
      const formData = new FormData();
      formData.append('file', uploadFile.raw);
      
      const res = await testUpload(formData);
      if (res.data.code === 0 && res.data.data) {
        uploadedImages.value.push(res.data.data);
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(res.data.message || '图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      ElMessage.error('图片上传失败，请重试');
    } finally {
      loading.value = false;
    }
  }
  return true;
};

const handleSubmit = async () => {
  if (!repairFormRef.value) return;

  await repairFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const locationData = {
          area: repairForm.location[0] || '',
          building: repairForm.location[1] || '',
          floor: repairForm.location[2] || ''
        };

        const repairData = {
          ...repairForm,
          location: JSON.stringify(locationData),
          status: 'pending',
          images: JSON.stringify(uploadedImages.value),
          creatorId: userSotre.loginUser?.id
        };

        const res = await submitRepair(repairData);
        if (res.data.code === 0) {
          ElMessage.success('报修提交成功');
          router.push('/');
        } else {
          ElMessage.error(res.data.message || '提交失败');
        }
      } catch (error) {
        console.error('提交报修失败:', error);
        ElMessage.error('提交失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

const locationOptions = ref([]);

// 获取位置信息
const fetchLocations = async () => {
  try {
    const res = await getAllLocations();
    if (res.data.code === 0) {
      // 转换数据为树形结构
      const transformToTree = (items: any[]) => {
        const map = new Map();
        const roots = [];

        // 先将所有项目转换为树节点格式并存入map
        items.forEach(item => {
          map.set(item.id, {
            value: item.name,
            label: item.name,
            children: []
          });
        });

        // 构建树形结构
        items.forEach(item => {
          const node = map.get(item.id);
          if (item.parentId === null) {
            roots.push(node);
          } else {
            const parent = map.get(item.parentId);
            if (parent) {
              parent.children.push(node);
            }
          }
        });

        return roots;
      };

      locationOptions.value = transformToTree(res.data.data);
    } else {
      ElMessage.error(res.data.message || '获取位置信息失败');
    }
  } catch (error) {
    console.error('获取位置信息失败:', error);
    ElMessage.error('获取位置信息失败，请重试');
  }
};

// 页面加载时获取位置信息
fetchLocations();
const repairRules = {
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  locationDetail: [{ required: true, message: '请输入详细位置', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  description: [{ required: true, message: '请描述问题', trigger: 'blur' }]
};

const equipmentOptions = ref([]);

// 获取设备类型
const fetchEquipmentTypes = async () => {
  try {
    const res = await getEquipmentTypes();
    if (res.data.code === 0) {
      equipmentOptions.value = res.data.data.map(type => ({
        label: type,
        value: type.toLowerCase().replace(/ /g, '_')
      }));
    } else {
      ElMessage.error(res.data.message || '获取设备类型失败');
    }
  } catch (error) {
    console.error('获取设备类型失败:', error);
    ElMessage.error('获取设备类型失败，请重试');
  }
};

// 页面加载时获取设备类型
fetchEquipmentTypes();
</script>

<style scoped lang="scss">
.new-repair-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;

  .new-repair-card {
    max-width: 800px;
    margin: 0 auto;

    .page-header {
      margin: -8px 0;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .w-full {
    width: 100%;
  }

  :deep(.el-upload--picture-card) {
    width: 120px;
    height: 120px;
    line-height: 120px;
  }
}
</style>