<template>
  <div class="dashboard-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="dashboard-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><DataLine /></el-icon>
            <span>概览</span>
          </el-menu-item>
          <el-menu-item index="repairs">
            <el-icon><List /></el-icon>
            <span>报修记录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main>
        <div class="dashboard-header">
          <h2>{{ pageTitle }}</h2>
          <el-button type="primary" @click="handleNewRepair">
            <el-icon><Plus /></el-icon>新建报修
          </el-button>
        </div>

        <!-- 概览面板 -->
        <template v-if="activeMenu === 'overview'">
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
        </template>

        <!-- 报修记录列表 -->
        <template v-else>
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
            <el-table-column prop="location" label="位置" width="180" />
            <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="180" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewDetail(row.id)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { DataLine, List, Plus, Search } from '@element-plus/icons-vue';

const router = useRouter();
const activeMenu = ref('overview');
const searchKeyword = ref('');
const statusFilter = ref('');

// Mock data
const stats = ref({
  pending: 5,
  processing: 8,
  completed: 12,
  pendingPercentage: 20,
  processingPercentage: 32,
  completedPercentage: 48
});

const repairs = ref([
  {
    id: 'R2023080001',
    type: '空调',
    location: '教学楼A-203',
    description: '空调制冷效果差',
    status: 'pending',
    createdAt: '2023-08-01 10:30:00'
  },
  {
    id: 'R2023080002',
    type: '水管',
    location: '宿舍楼3-521',
    description: '水管漏水',
    status: 'processing',
    createdAt: '2023-08-01 14:20:00'
  },
  {
    id: 'R2023080003',
    type: '电路',
    location: '图书馆2楼',
    description: '插座无法使用',
    status: 'completed',
    createdAt: '2023-08-02 09:15:00'
  }
]);

const pageTitle = computed(() => {
  return activeMenu.value === 'overview' ? '工作台' : '报修记录';
});

const filteredRepairs = computed(() => {
  let result = repairs.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(item =>
      item.id.toLowerCase().includes(keyword) ||
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

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

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
</script>

<style scoped lang="scss">
.dashboard-container {
  height: 100vh;
  background-color: #f5f7fa;

  .el-container {
    height: 100%;
  }

  .el-aside {
    background-color: #fff;
    border-right: 1px solid #e6e6e6;
  }

  .dashboard-menu {
    height: 100%;
    border-right: none;
  }

  .el-main {
    padding: 20px;
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