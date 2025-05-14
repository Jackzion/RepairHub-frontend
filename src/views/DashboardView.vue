<template>
  <div class="dashboard-container">
    <el-container>
      <el-main>
        <div class="dashboard-header">
          <h2>工作台</h2>
          <el-button type="primary" @click="handleNewRepair">
            <el-icon><Plus /></el-icon>新建报修
          </el-button>
        </div>

        <!-- 概览面板 -->
        <el-row :gutter="20" class="dashboard-stats">
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>待处理</span>
                    <el-tag type="danger">{{ stats.pending }}</el-tag>
                  </div>
                </template>
                <div class="card-content">
                  <el-progress
                    type="dashboard"
                    :percentage="stats.pendingPercentage"
                    status="exception"
                  />
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>处理中</span>
                    <el-tag type="warning">{{ stats.processing }}</el-tag>
                  </div>
                </template>
                <div class="card-content">
                  <el-progress
                    type="dashboard"
                    :percentage="stats.processingPercentage"
                    status="warning"
                  />
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>已完成</span>
                    <el-tag type="success">{{ stats.completed }}</el-tag>
                  </div>
                </template>
                <div class="card-content">
                  <el-progress
                    type="dashboard"
                    :percentage="stats.completedPercentage"
                    status="success"
                  />
                </div>
              </el-card>
            </el-col>
          </el-row>

        <!-- 报修记录列表 -->
          <div class="repair-list-header">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索报修记录"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>

          <el-table :data="filteredRepairs" style="width: 100%">
            <el-table-column prop="id" label="报修单号" width="120" />
            <el-table-column prop="type" label="设备类型" width="120" />
            <el-table-column prop="location" label="位置" width="180">
              <template #default="{ row }">
                {{ typeof row.location === 'string' ? JSON.parse(row.location).area + ' - ' + JSON.parse(row.location).building + ' - ' + JSON.parse(row.location).floor : row.location?.area + ' - ' + row.location?.building + ' - ' + row.location?.floor }} {{ row.locationDetail }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>            
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <div class="operation-buttons">
                  <el-button link type="primary" @click="viewDetail(row.id)">
                    查看详情
                  </el-button>
                  <el-button v-if="row.status === 'pending' && loginUser.role === USER_ROLE_ENUM.USER" link type="danger" @click="handleDelete(row.id)">
                    取消工单
                  </el-button>
                  <el-button v-if="row.status !== 'completed' && loginUser.role === USER_ROLE_ENUM.ADMIN" link type="danger" @click="handleFinish(row.id)">
                    强制删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { DataLine, List, Plus, Search } from '@element-plus/icons-vue';
import { getUserRepairs, getUserRepairs1 , cancelPendingRepair , forceCloseRepair } from '../api/repairsController';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useLoginUserStore } from '../stores/user'
import  USER_ROLE_ENUM  from '../enums/USER_ROLE_ENUM';

const router = useRouter();
const searchKeyword = ref('');
const statusFilter = ref('');

const userStore = useLoginUserStore()
const loginUser = computed(() => userStore.loginUser)

// Mock data
const stats = ref({
  pending: 5,
  processing: 8,
  completed: 12,
  pendingPercentage: 20,
  processingPercentage: 32,
  completedPercentage: 48
});

const repairs = ref<API.Repairs[]>([])

onMounted(() => {
  fetchRepairs();
});

const fetchRepairs = async () => {
  const res = await getUserRepairs1();
  repairs.value = res.data.data.repairsList;
  stats.value = res.data.data.repairsStatistics;
};

const filteredRepairs = computed(() => {
  let result = repairs.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(item =>
      String(item.id).toLowerCase().includes(keyword) ||
      item.type.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    );
  }

  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value);
  }

  return result;
});

const handleNewRepair = () => {
  router.push('/repair/new');
};

const viewDetail = (id: string) => {
  router.push(`/repair/${id}`);
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    completed: 'success'
  };
  return types[status] || 'info';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  return texts[status] || status;
};

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该报修工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await cancelPendingRepair({repairId:id});
    ElMessage.success('删除成功');
    fetchRepairs();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleFinish = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认强制完成该报修工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await cancelPendingRepair({repairId:id});
    ElMessage.success('强制完成成功');
    fetchRepairs();
  }
  catch (error) {
    if (error!== 'cancel') {
      ElMessage.error('强制完成失败');
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;

  .el-container {
    min-height: 100%;  // 改为 min-height
  }

  .el-main {
    padding: 20px;
    height: auto;  // 添加这行
    overflow: visible;  // 添加这行
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .dashboard-stats {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-content {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
  }

  .repair-list-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .search-input {
      width: 300px;
    }
  }
}
</style>