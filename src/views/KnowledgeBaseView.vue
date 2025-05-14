<template>
  <div class="knowledge-container">
    <el-card class="knowledge-card">
      <template #header>
        <div class="card-header">
          <h2>知识库</h2>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问题或关键词"
            class="search-input"
            :prefix-icon="Search"
            clearable
          />
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="常见问题" name="faq">
          <el-collapse v-model="activeNames">
            <el-collapse-item
              v-for="item in filteredFaqList"
              :key="item.id"
              :title="item.question"
              :name="item.id"
            >
              <div class="faq-content">
                <p>{{ item.answer }}</p>
                <div class="faq-tags" v-if="item.tags && item.tags.length">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    size="small"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>

        <el-tab-pane label="维修指南" name="guides">
          <el-row :gutter="20">
            <el-col
              v-for="guide in filteredGuideList"
              :key="guide.id"
              :span="8"
            >
              <el-card class="guide-card" shadow="hover">
                <template #header>
                  <div class="guide-header">
                    <el-icon :size="20"><Document /></el-icon>
                    <span>{{ guide.title }}</span>
                  </div>
                </template>
                <div class="guide-content">
                  <p>{{ guide.description }}</p>
                  <div class="guide-footer">
                    <span class="guide-category">{{ guide.category }}</span>
                    <el-button type="primary" link @click="viewGuide(guide)">
                      查看详情
                    </el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 维修指南详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedGuide?.title"
      width="60%"
      class="guide-dialog"
    >
      <div class="guide-detail" v-if="selectedGuide">
        <h3>概述</h3>
        <p>{{ selectedGuide.description }}</p>

        <h3>适用设备</h3>
        <p>{{ selectedGuide.applicableDevices }}</p>

        <h3>步骤说明</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in selectedGuide.steps"
            :key="index"
            :timestamp="`步骤 ${index + 1}`"
          >
            {{ step }}
          </el-timeline-item>
        </el-timeline>

        <h3>注意事项</h3>
        <ul class="notice-list">
          <li v-for="(notice, index) in selectedGuide.notices" :key="index">
            {{ notice }}
          </li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Document } from '@element-plus/icons-vue'

const activeTab = ref('faq')
const activeNames = ref([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const selectedGuide = ref(null)

// Mock数据
const faqList = ref([
  {
    id: 1,
    question: '空调不制冷怎么办？',
    answer: '1. 检查空调是否处于制冷模式\n2. 检查温度设置是否合适\n3. 检查过滤网是否需要清洗\n4. 如果以上都正常但仍不制冷，可能是制冷剂不足，需要专业维修。',
    tags: ['空调', '制冷', '常见问题']
  },
  {
    id: 2,
    question: '电梯突然停止运行如何处理？',
    answer: '1. 保持冷静，按下报警按钮\n2. 通过对讲机与工作人员联系\n3. 不要强行撬开门\n4. 等待救援人员到达',
    tags: ['电梯', '应急', '安全']
  },
  {
    id: 3,
    question: '饮水机出水很慢是什么原因？',
    answer: '1. 检查进水管是否折叠\n2. 检查过滤芯是否需要更换\n3. 检查水压是否正常\n4. 如果以上都正常，可能需要清洗水路',
    tags: ['饮水机', '维护']
  },
  {
    id: 4,
    question: '监控摄像头画面模糊怎么解决？',
    answer: '1. 检查摄像头镜头是否有灰尘或污渍\n2. 确认网络连接状态是否稳定\n3. 检查摄像头参数设置是否正确\n4. 调整摄像头焦距和角度\n5. 如果以上都正常，可能是设备故障需要维修',
    tags: ['监控', '摄像头', '图像质量']
  },
  {
    id: 5,
    question: '门禁卡失效如何处理？',
    answer: '1. 检查门禁卡是否受损或变形\n2. 确认门禁卡是否在有效期内\n3. 尝试重新刷卡或更换刷卡位置\n4. 联系管理员检查门禁系统是否正常\n5. 必要时申请更换新卡',
    tags: ['门禁', '安防', '卡片管理']
  },
  {
    id: 6,
    question: '打印机卡纸如何处理？',
    answer: '1. 关闭打印机电源\n2. 按照指示打开检修盖\n3. 仔细取出卡住的纸张，注意不要用力过猛\n4. 检查纸张通道是否有碎纸残留\n5. 确认纸张规格是否符合要求',
    tags: ['打印机', '故障处理', '日常维护']
  },
  {
    id: 7,
    question: '投影仪无法开机怎么办？',
    answer: '1. 检查电源线是否正确连接\n2. 确认电源按钮是否正常工作\n3. 检查指示灯状态\n4. 等待投影仪冷却后再尝试开机\n5. 如果仍然无法开机，可能需要专业维修',
    tags: ['投影仪', '故障', '设备维护']
  },
  {
    id: 8,
    question: '会议室音响有杂音怎么处理？',
    answer: '1. 检查音频线缆连接是否牢固\n2. 调整音量和音调设置\n3. 检查是否存在电磁干扰\n4. 测试不同的音源\n5. 必要时请专业人员检修',
    tags: ['音响', '音质', '会议设备']
  }
])

const guideList = ref([
  {
    id: 1,
    title: '中央空调系统维护指南',
    description: '详细介绍中央空调系统的日常维护和故障处理方法',
    category: '空调维护',
    applicableDevices: '中央空调主机、风机盘管、新风系统',
    steps: [
      '检查空调系统运行状态和参数',
      '清洁过滤网和散热器',
      '检查制冷剂压力和温度',
      '检查电气控制系统',
      '记录运行数据并分析'
    ],
    notices: [
      '进行维护时必须关闭电源',
      '制冷剂处理需要专业资质',
      '定期记录运行参数很重要'
    ]
  },
  {
    id: 2,
    title: '电梯日常检查指南',
    description: '电梯日常检查和维护的标准操作流程',
    category: '电梯维护',
    applicableDevices: '客梯、货梯',
    steps: [
      '检查轿厢运行是否平稳',
      '测试所有按钮和显示装置',
      '检查门机运行情况',
      '检查紧急报警装置',
      '记录检查结果'
    ],
    notices: [
      '检查时需要两人配合',
      '发现异常立即报修',
      '保持记录完整性'
    ]
  },
  {
    id: 3,
    title: '饮水机清洗消毒指南',
    description: '饮水机定期清洗和消毒的操作指南',
    category: '饮水设备',
    applicableDevices: '立式饮水机、台式饮水机',
    steps: [
      '断开电源并放空水箱',
      '拆卸可拆部件',
      '清洗水箱和管路',
      '消毒处理',
      '组装并试运行'
    ],
    notices: [
      '使用食品级消毒剂',
      '确保彻底冲洗干净',
      '定期更换滤芯'
    ]
  },
  {
    id: 4,
    title: '监控系统维护指南',
    description: '监控系统的日常维护和故障排除方法',
    category: '安防设备',
    applicableDevices: '监控摄像头、录像机、显示器',
    steps: [
      '检查摄像头清晰度和角度',
      '测试录像功能是否正常',
      '检查存储空间使用情况',
      '清理摄像头镜头',
      '更新系统配置',
      '备份重要录像资料'
    ],
    notices: [
      '定期检查存储容量',
      '保护设备防止雨水侵蚀',
      '及时更新系统补丁'
    ]
  },
  {
    id: 5,
    title: '门禁系统维护手册',
    description: '门禁系统的安装、维护和故障处理指南',
    category: '安防设备',
    applicableDevices: '门禁控制器、读卡器、电磁锁',
    steps: [
      '检查读卡器感应状态',
      '测试门锁开关功能',
      '检查后备电源',
      '更新门禁权限配置',
      '检查数据通信状态',
      '维护门禁数据库'
    ],
    notices: [
      '定期备份门禁数据',
      '检查紧急开门装置',
      '及时更新系统固件'
    ]
  },
  {
    id: 6,
    title: '打印机维修保养指南',
    description: '办公打印设备的日常维护和故障排除指南',
    category: '办公设备',
    applicableDevices: '激光打印机、喷墨打印机、多功能一体机',
    steps: [
      '清洁打印头和送纸轮',
      '检查耗材使用情况',
      '校准打印颜色',
      '测试打印质量',
      '清理打印机内部',
      '更新打印机驱动'
    ],
    notices: [
      '使用原厂耗材',
      '定期除尘清洁',
      '打印机断电后再维护'
    ]
  },
  {
    id: 7,
    title: '会议室设备维护指南',
    description: '会议室多媒体设备的调试和维护方法',
    category: '会议设备',
    applicableDevices: '投影仪、音响系统、视频会议设备',
    steps: [
      '检查设备连接状态',
      '测试音视频效果',
      '调试会议系统',
      '清洁投影镜头',
      '检查无线连接',
      '更新设备固件'
    ],
    notices: [
      '使用后及时关闭设备',
      '保持通风散热',
      '定期检查线路连接'
    ]
  },
  {
    id: 8,
    title: 'UPS电源维护指南',
    description: '不间断电源系统的检查和维护流程',
    category: '电力设备',
    applicableDevices: 'UPS主机、蓄电池组、配电单元',
    steps: [
      '检查电池电压',
      '测试切换功能',
      '检查散热系统',
      '清洁设备外观',
      '记录运行数据',
      '测试报警功能'
    ],
    notices: [
      '定期检查电池状态',
      '确保通风良好',
      '记录维护日志'
    ]
  }
])

const filteredFaqList = computed(() => {
  if (!searchKeyword.value) return faqList.value
  const keyword = searchKeyword.value.toLowerCase()
  return faqList.value.filter(item =>
    item.question.toLowerCase().includes(keyword) ||
    item.answer.toLowerCase().includes(keyword) ||
    item.tags.some(tag => tag.toLowerCase().includes(keyword))
  )
})

const filteredGuideList = computed(() => {
  if (!searchKeyword.value) return guideList.value
  const keyword = searchKeyword.value.toLowerCase()
  return guideList.value.filter(item =>
    item.title.toLowerCase().includes(keyword) ||
    item.description.toLowerCase().includes(keyword) ||
    item.category.toLowerCase().includes(keyword)
  )
})

const viewGuide = (guide) => {
  selectedGuide.value = guide
  dialogVisible.value = true
}
</script>

<style scoped lang="scss">
.knowledge-container {
  padding: 20px;

  .knowledge-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      h2 {
        margin: 0;
        white-space: nowrap;
      }

      .search-input {
        max-width: 300px;
      }
    }
  }

  .faq-content {
    .faq-tags {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
  }

  .guide-card {
    margin-bottom: 20px;

    .guide-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .guide-content {
      .guide-footer {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .guide-category {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
}

.guide-dialog {
  .guide-detail {
    h3 {
      margin: 20px 0 12px;
      color: #303133;
      font-size: 16px;

      &:first-child {
        margin-top: 0;
      }
    }

    .notice-list {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        color: #606266;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>