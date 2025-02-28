<template>
  <div class="admin-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataLine /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="logs">
            <el-icon><Document /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main>
        <div class="admin-header">
          <h2>{{ pageTitle }}</h2>
        </div>

        <!-- 数据统计面板 -->
        <template v-if="activeMenu === 'dashboard'">
          <el-row :gutter="20" class="dashboard-stats">
            <el-col :span="8" v-for="stat in statsData" :key="stat.title">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>{{ stat.title }}</span>
                    <el-tag :type="stat.type">{{ stat.value }}</el-tag>
                  </div>
                </template>
                <div class="card-content">
                  <el-progress
                    type="dashboard"
                    :percentage="stat.percentage"
                    :status="stat.status"
                  />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 趋势图表 -->
          <el-row :gutter="20" class="chart-section">
            <el-col :span="12">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>报修趋势</span>
                  </div>
                </template>
                <div class="chart-container">
                  <!-- TODO: 集成图表组件 -->
                  <div class="chart-placeholder">报修数量趋势图</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>设备类型分布</span>
                  </div>
                </template>
                <div class="chart-container">
                  <!-- TODO: 集成图表组件 -->
                  <div class="chart-placeholder">设备类型饼图</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>

        <!-- 用户管理 -->
        <template v-if="activeMenu === 'users'">
          <el-card>
            <div class="table-operations">
              <el-input
                v-model="userSearch"
                placeholder="搜索用户"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleAddUser">
                <el-icon><Plus /></el-icon>添加用户
              </el-button>
            </div>

            <el-table :data="filteredUsers" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="用户名" />
              <el-table-column prop="role" label="角色">
                <template #default="{ row }">
                  <el-tag :type="getRoleTagType(row.role)">
                    {{ getRoleText(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" @click="handleEditUser(row)">
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="handleDeleteUser(row)"
                    >
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="totalUsers"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </template>

        <!-- 系统日志 -->
        <template v-if="activeMenu === 'logs'">
          <el-card>
            <div class="table-operations">
              <el-date-picker
                v-model="logDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="date-picker"
              />
              <el-select v-model="logType" placeholder="日志类型" class="type-select">
                <el-option label="全部" value="" />
                <el-option label="系统" value="system" />
                <el-option label="操作" value="operation" />
                <el-option label="错误" value="error" />
              </el-select>
            </div>

            <el-table :data="filteredLogs" style="width: 100%">
              <el-table-column prop="timestamp" label="时间" width="180" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLogTypeTag(row.type)">
                    {{ getLogTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容" />
              <el-table-column prop="operator" label="操作人" width="120" />
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="logCurrentPage"
                v-model:page-size="logPageSize"
                :total="totalLogs"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleLogSizeChange"
                @current-change="handleLogCurrentChange"
              />
            </div>
          </el-card>
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine,
  User,
  Document,
  Search,
  Plus
} from '@element-plus/icons-vue'

// 菜单激活状态
const activeMenu = ref('dashboard')
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: '数据统计',
    users: '用户管理',
    logs: '系统日志'
  }
  return titles[activeMenu.value] || ''
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 数据统计
const statsData = ref([
  {
    title: '总用户数',
    value: 150,
    percentage: 85,
    type: 'primary',
    status: 'success'
  },
  {
    title: '本月报修',
    value: 48,
    percentage: 65,
    type: 'warning',
    status: 'warning'
  },
  {
    title: '完成率',
    value: '92%',
    percentage: 92,
    type: 'success',
    status: 'success'
  }
])

// 用户管理
const userSearch = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// 模拟用户数据
const users = ref([
  {
    id: 1,
    name: '管理员',
    role: 'admin',
    createdAt: '2024-01-01 12:00:00'
  },
  {
    id: 2,
    name: '维修人员1',
    role: 'maintainer',
    createdAt: '2024-01-02 12:00:00'
  },
  {
    id: 3,
    name: '用户1',
    role: 'user',
    createdAt: '2024-01-03 12:00:00'
  }
])

const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.name.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

const getRoleTagType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    maintainer: 'warning',
    user: 'info'
  }
  return types[role] || 'info'
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    maintainer: '维修人员',
    user: '普通用户'
  }
  return texts[role] || '未知角色'
}

const handleAddUser = () => {
  // TODO: 实现添加用户逻辑
  ElMessage.info('添加用户功能开发中')
}

const handleEditUser = (user: any) => {
  // TODO: 实现编辑用户逻辑
  ElMessage.info('编辑用户功能开发中')
}

const handleDeleteUser = (user: any) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除用户逻辑
    ElMessage.success('用户删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载用户数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载用户数据
}

// 系统日志
const logDateRange = ref([])
const logType = ref('')
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const totalLogs = ref(0)

// 模拟日志数据
const logs = ref([
  {
    timestamp: '2024-01-20 10:00:00',
    type: 'system',
    content: '系统启动',
    operator: 'System'
  },
  {
    timestamp: '2024-01-20 10:05:00',
    type: 'operation',
    content: '用户登录',
    operator: '管理员'
  },
  {
    timestamp: '2024-01-20 10:10:00',
    type: 'error',
    content: '数据库连接失败',
    operator: 'System'
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (logType.value && log.type !== logType.value) return false
    // TODO: 实现日期范围筛选
    return true
  })
})

const getLogTypeTag = (type: string) => {
  const types: Record<string, string> = {
    system: 'info',
    operation: 'success',
    error: 'danger'
  }
  return types[type] || 'info'
}

const getLogTypeText = (type: string) => {
  const texts: Record<string, string> = {
    system: '系统',
    operation: '操作',
    error: '错误'
  }
  return texts[type] || '未知'
}

const handleLogSizeChange = (val: number) => {
  logPageSize.value = val
  // TODO: 重新加载日志数据
}

const handleLogCurrentChange = (val: number) => {
  logCurrentPage.value = val
  // TODO: 重新加载日志数据
}
</script>

<style scoped lang="scss">
.admin-container {
  height: 100vh;
  background-color: #f5f7fa;

  .admin-menu {
    height: 100%;
    border-right: none;
  }

  .admin-header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-weight: 500;
      color: #303133;
    }
  }

  .dashboard-stats {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .chart-section {
    margin-bottom: 20px;

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;

      .chart-placeholder {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .table-operations {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;

    .search-input {
      width: 200px;
    }

    .date-picker {
      width: 320px;
    }

    .type-select {
      width: 120px;
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-card) {
    border-radius: 8px;
    
    .el-card__header {
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
    }

    .el-card__body {
      padding: 16px;
    }
  }

  :deep(.el-table) {
    border-radius: 8px;

    th.el-table__cell {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 500;
    }
  }

  :deep(.el-pagination) {
    padding: 0;
    margin: 0;
  }
}
</style>