<template>
  <div class="equipment-container">
    <el-card class="equipment-card">
      <template #header>
        <div class="card-header">
          <h2>设备管理</h2>
          <div class="header-buttons">
            <el-button type="primary" @click="showTypeDialog = true">
              <el-icon><Plus /></el-icon>添加设备类型
            </el-button>
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>添加设备
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计图表区域 -->
      <div class="charts-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-wrapper">
              <h3>设备类型分布</h3>
              <div ref="typeChartRef" style="height: 300px"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-wrapper">
              <h3>设备状态分布</h3>
              <div ref="statusChartRef" style="height: 300px"></div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-select v-model="filterType" placeholder="按设备类型筛选" clearable>
          <el-option
            v-for="type in equipmentTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
        <el-select v-model="filterStatus" placeholder="按状态筛选" clearable>
          <el-option label="正常" value="normal" />
          <el-option label="维修中" value="maintenance" />
          <el-option label="故障" value="broken" />
        </el-select>
      </div>

      <!-- 设备列表 -->
      <el-table :data="filteredEquipments" style="width: 100%">
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="type" label="设备类型" />
        <el-table-column prop="model" label="型号" />
        <el-table-column label="位置">
          <template #default="{ row }">
            {{ formatLocation(row.location) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="showQRCode(row.id)">查看</el-button>
            <el-button link type="primary" @click="editEquipment(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteEquipment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑设备类型对话框 -->
    <el-dialog
      v-model="showTypeDialog"
      :title="editingType ? '编辑设备类型' : '添加设备类型'"
      width="500px"
    >
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="类型名称" required>
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="typeForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTypeDialog = false">取消</el-button>
          <el-button type="primary" @click="saveType">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加设备对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="'添加设备'"
      width="500px"
    >
      <el-form :model="equipmentAddForm" label-width="100px">
        <el-form-item label="设备类型">
          <el-select v-model="equipmentAddForm.type" placeholder="选择设备类型">
            <el-option
              v-for="type in equipmentTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="equipmentAddForm.model" />
        </el-form-item>
        <el-form-item label="位置" required>
          <el-cascader
            v-model="equipmentAddForm.location"
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
        <el-form-item label="状态">
          <el-select v-model="equipmentAddForm.status">
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="故障" value="broken" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="equipmentAddForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEquipment">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑设备对话框 -->
    <el-dialog
      v-model="showUpdateDialog"
      :title="'编辑设备'"
      width="500px"
    >
      <el-form :model="equipmentUpdateForm" label-width="100px">
        <el-form-item label="型号">
          <el-input v-model="equipmentUpdateForm.model" />
        </el-form-item>
        <el-form-item label="位置" required>
          <el-cascader
            v-model="equipmentUpdateForm.location"
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
        <el-form-item label="状态">
          <el-select v-model="equipmentUpdateForm.status">
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="故障" value="broken" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="equipmentUpdateForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdateDialog = false">取消</el-button>
          <el-button type="primary" @click="updateEquipment">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 二维码对话框 -->
    <el-dialog
      v-model="showQRDialog"
      title="扫描二维码查看设备详情"
      width="300px"
      align-center
    >
      <div class="qr-container" style="display: flex; justify-content: center; padding: 20px;">
        <QRCodeVue :value="currentQRUrl" :size="200" level="H" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import QRCodeVue from 'qrcode.vue'
import { getEquipmentTypes , addEquipmentTypes } from '../api/equipmentTypesController'
import { listEquipments , addEquipment , updateEquipments, deleteEquipments } from '../api/equipmentController'
import { getAllLocations } from '../api/locationController'
import { useRouter } from 'vue-router'

// 状态变量
const showTypeDialog = ref(false)
const showAddDialog = ref(false)
const showUpdateDialog = ref(false)
const editingType = ref(null)
const editingEquipment = ref(null)
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const typeChartRef = ref(null)
const statusChartRef = ref(null)
const router = useRouter()
const showQRDialog = ref(false)
const currentQRUrl = ref('')

// 表单数据
const typeForm = ref({
  name: '',
  description: ''
})

const equipmentAddForm = ref({
  type: '',
  model: '',
  location: [],
  status: 'normal',
  description: ''
})

const equipmentUpdateForm = ref({
  id: '',
  model: '',
  location: [],
  status: 'normal',
  description: ''
})

// 数据列表
const equipmentTypes = ref([])
const equipments = ref([])

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

// 计算属性
const filteredEquipments = computed(() => {
  return equipments.value.filter(item => {
    const typeMatch = !filterType.value || item.type === filterType.value
    const statusMatch = !filterStatus.value || item.status === filterStatus.value
    return typeMatch && statusMatch
  })
})

// 工具函数
const getStatusType = (status) => {
  const types = {
    normal: 'success',
    broken: 'danger',
    maintenance: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    normal: '正常',
    maintenance: '维修中',
    broken: '故障'
  }
  return texts[status] || '未知'
}

const formatLocation = (location) => {
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location
    return `${loc.area} - ${loc.building} - ${loc.floor}`
  } catch (e) {
    return '位置未知'
  }
}

// 图表初始化
const initTypeChart = () => {
  if (!typeChartRef.value) return
  
  const chart = echarts.init(typeChartRef.value)
  const typeStats = {}
  equipments.value.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1
  })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: Object.entries(typeStats).map(([name, value]) => ({ name, value })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  chart.setOption(option)
}

const initStatusChart = () => {
  if (!statusChartRef.value) return
  
  const chart = echarts.init(statusChartRef.value)
  const statusStats = {}
  equipments.value.forEach(item => {
    statusStats[getStatusText(item.status)] = (statusStats[getStatusText(item.status)] || 0) + 1
  })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: Object.entries(statusStats).map(([name, value]) => ({ name, value })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  chart.setOption(option)
}

const fetchEquipmentTypes = async () => {
  try {
    const res = await getEquipmentTypes()
    equipmentTypes.value = res.data.data || []
  } catch (error) {
    ElMessage.error('设备类型加载失败')
    console.error(error)
  }
}

const fetchEquimentList = async () => {
  try {
    const res = await listEquipments({})
    equipments.value = res.data.data || []
  } catch (error) {
    ElMessage.error('设备列表加载失败')
    console.error(error)
  }
}

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true
    fetchLocations()
    const [typesRes, equipmentsRes] = await Promise.all([
      getEquipmentTypes(),
      listEquipments({})
    ])
    equipmentTypes.value = typesRes.data.data || []
    equipments.value = equipmentsRes.data.data || []
    
    initTypeChart()
    initStatusChart()
  } catch (error) {
    ElMessage.error('数据加载失败')
    console.error(error)
  } finally {
    loading.value = false
  }
})

// 事件处理函数
const saveType = () => {
  if (!typeForm.value.name) {
    ElMessage.warning('请输入设备类型名称')
    return
  }

  addEquipmentTypes({...typeForm.value})

  // TODO: 调用添加设备类型API
  ElMessage.success('保存成功')
  fetchEquipmentTypes()
  showTypeDialog.value = false
  typeForm.value = { name: '', description: '' }
}

const saveEquipment = async () => {

  try {
    const locationPath = equipmentAddForm.value.location
    const locationData = {
      area: locationPath[0],
      building: locationPath[1],
      floor: locationPath[2]
    }

    const data = {
      ...equipmentAddForm.value,
      location: JSON.stringify(locationData)
    }

    await addEquipment(data)
    await fetchEquimentList()
    ElMessage.success('保存成功')
    showAddDialog.value = false
    equipmentAddForm.value = {
      type: '',
      model: '',
      location: [],
      status: 'normal',
      description: ''
    }
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  }
}

const updateEquipment = async () => {

try {
  const locationPath = equipmentUpdateForm.value.location
  const locationData = {
    area: locationPath[0],
    building: locationPath[1],
    floor: locationPath[2]
  }

  const data = {
    ...equipmentUpdateForm.value,
    location: JSON.stringify(locationData)
  }

  await updateEquipments({...data})
  await fetchEquimentList()
  ElMessage.success('保存成功')
  showUpdateDialog.value = false
} catch (error) {
  ElMessage.error('保存失败')
  console.error(error)
}
}

const editEquipment = (row) => {
  editingEquipment.value = row
  const location = typeof row.location === 'string' ? JSON.parse(row.location) : row.location
  equipmentUpdateForm.value = {
    id: row.id,
    model: row.model,
    status: row.status,
    description: row.description,
    location: [location.area, location.building, location.floor]
  }
  showUpdateDialog.value = true
}

const showQRCode = (id) => {
  currentQRUrl.value = `http://localhost:5173/equipment/${id}`
  showQRDialog.value = true
}

const deleteEquipment = async (row) => {
  try {
    // TODO: 调用删除设备API
    await deleteEquipments({id: row.id})
    ElMessage.success('删除成功')
    equipments.value = equipments.value.filter(item => item.id !== row.id)
    initTypeChart()
    initStatusChart()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}
</script>

<style scoped lang="scss">
.equipment-container {
  padding: 20px;

  .equipment-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
      }

      .header-buttons {
        display: flex;
        gap: 12px;
      }
    }
  }

  .charts-container {
    margin-bottom: 20px;

    .chart-wrapper {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

      h3 {
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
      }
    }
  }

  .filter-section {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
