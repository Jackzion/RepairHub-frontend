<template>
  <div class="admin-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
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
              <el-table-column prop="createdAt" label="时间" width="180" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLogTypeTag(row.type)">
                    {{ getLogTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容" />
              <el-table-column prop="operatorId" label="操作者ID" width="120" />
              <el-table-column prop="ip" label="IP地址" width="140" />
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Document,
  Search,
  Plus
} from '@element-plus/icons-vue'
import { getUserPage, addUser, updateUser, banUser } from '../api/userController'
import { getSystemLogPage } from '../api/systemLogController'
import { watch } from 'vue'
import dayjs from 'dayjs'

// 菜单激活状态
const activeMenu = ref('users')
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    users: '用户管理',
    logs: '系统日志'
  }
  return titles[activeMenu.value] || ''
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 用户管理
const userSearch = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)
const users = ref<API.Users[]>([])

// 加载用户数据
const loadUsers = async () => {
  try {
    const res = await getUserPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      search: userSearch.value
    })
    if (res.data) {
      users.value = res.data.data.records
      totalUsers.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

// 初始化加载
onMounted(() => {
  loadUsers()
  loadLogs()
})

const filteredUsers = computed(() => users.value)

const getRoleTagType = (role: string) => {
  const types: Record<number, string> = {
    2: 'danger',
    3: 'warning',
    1: 'info'
  }
  return types[role] || 'info'
}

const getRoleText = (role: string) => {
  const texts: Record<number, string> = {
    2: '管理员',
    3: '维修人员',
    1: '普通用户'
  }
  return texts[role] || '未知角色'
}

const handleAddUser = async () => {
  try {
    const result = await addUser({
      username: 'new_user',  // 这里需要添加用户表单
      password: '123456',
      role: 'user'
    })
    if (result.data) {
      ElMessage.success('添加用户成功')
      loadUsers()
    }
  } catch (error) {
    ElMessage.error('添加用户失败')
  }
}

const handleEditUser = async (user: API.Users) => {
  try {
    const result = await updateUser({
      id: user.id,
      username: user.username,
      role: user.role
    })
    if (result.data) {
      ElMessage.success('更新用户成功')
      loadUsers()
    }
  } catch (error) {
    ElMessage.error('更新用户失败')
  }
}

const handleDeleteUser = (user: API.Users) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const result = await banUser({ id: user.id })
      if (result.data) {
        ElMessage.success('用户删除成功')
        loadUsers()
      }
    } catch (error) {
      ElMessage.error('删除用户失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadUsers()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadUsers()
}

// 系统日志
const logDateRange = ref<[Date, Date] | null>(null)
const logType = ref('')
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const totalLogs = ref(0)
const logs = ref<API.SystemLogs[]>([])

// 加载日志数据
const loadLogs = async () => {
  try {
    const res = await getSystemLogPage({
      pageNum: logCurrentPage.value,
      pageSize: logPageSize.value,
      type: logType.value || undefined,
      from: logDateRange.value ? dayjs(logDateRange.value[0]).format('YYYY-MM-DD') : undefined,
      to: logDateRange.value ? dayjs(logDateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    if (res.data) {
      logs.value = res.data.data.records
      totalLogs.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取系统日志失败')
  }
}

// 监听筛选条件变化
watch([logType, logDateRange], () => {
  logCurrentPage.value = 1
  loadLogs()
})

const filteredLogs = computed(() => logs.value)

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
  loadLogs()
}

const handleLogCurrentChange = (val: number) => {
  logCurrentPage.value = val
  loadLogs()
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