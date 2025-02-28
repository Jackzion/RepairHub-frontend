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
            <el-option label="空调" value="air_conditioner" />
            <el-option label="水管" value="plumbing" />
            <el-option label="电路" value="electrical" />
            <el-option label="门窗" value="doors_windows" />
            <el-option label="其他" value="others" />
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
            <el-radio label="normal">普通</el-radio>
            <el-radio label="urgent">紧急</el-radio>
            <el-radio label="very_urgent">特急</el-radio>
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

const router = useRouter();
const repairFormRef = ref();
const loading = ref(false);
const fileList = ref<UploadFile[]>([]);

interface RepairForm {
  type: string;
  location: string[];
  locationDetail: string;
  priority: string;
  description: string;
}

const repairForm = reactive<RepairForm>({
  type: '',
  location: [],
  locationDetail: '',
  priority: 'normal',
  description: ''
});

// Mock location data
const locationOptions = [
  {
    value: 'teaching_building',
    label: '教学楼',
    children: [
      {
        value: 'building_a',
        label: 'A楼',
        children: [
          { value: '1f', label: '1楼' },
          { value: '2f', label: '2楼' },
          { value: '3f', label: '3楼' }
        ]
      },
      {
        value: 'building_b',
        label: 'B楼',
        children: [
          { value: '1f', label: '1楼' },
          { value: '2f', label: '2楼' },
          { value: '3f', label: '3楼' }
        ]
      }
    ]
  },
  {
    value: 'dormitory',
    label: '宿舍楼',
    children: [
      {
        value: 'building_1',
        label: '1号楼',
        children: [
          { value: '1f', label: '1楼' },
          { value: '2f', label: '2楼' },
          { value: '3f', label: '3楼' },
          { value: '4f', label: '4楼' },
          { value: '5f', label: '5楼' }
        ]
      },
      {
        value: 'building_2',
        label: '2号楼',
        children: [
          { value: '1f', label: '1楼' },
          { value: '2f', label: '2楼' },
          { value: '3f', label: '3楼' },
          { value: '4f', label: '4楼' },
          { value: '5f', label: '5楼' }
        ]
      }
    ]
  }
];

const repairRules = {
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  locationDetail: [{ required: true, message: '请输入详细位置', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  description: [{ required: true, message: '请描述问题', trigger: 'blur' }]
};

const handleFileChange = (uploadFile: UploadFile) => {
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
  return true;
};

const handleSubmit = async () => {
  if (!repairFormRef.value) return;

  await repairFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // TODO: 实现提交API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        ElMessage.success('报修提交成功');
        router.push('/');
      } catch (error) {
        ElMessage.error('提交失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};
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