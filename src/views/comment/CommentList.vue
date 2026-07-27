<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索提问内容" style="width:240px" clearable @clear="fetchList" @keyup.enter="fetchList" />
      <el-button type="primary" @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="content" label="提问内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="reply" label="回复" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.reply" style="color:#67c23a">{{ row.reply }}</span>
          <span v-else style="color:#c0c4cc">未回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提问时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" type="primary" @click="openReply(row)">{{ row.reply ? '编辑回复' : '回复' }}</el-button>
            <el-popconfirm title="确定删除该提问？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top:16px;justify-content:flex-end"
      @size-change="fetchList"
      @current-change="fetchList"
    />

    <!-- 回复 Dialog -->
    <el-dialog title="回复提问" v-model="replyVisible" width="500px">
      <p style="margin-bottom:12px;color:#909399">{{ replyTarget.content }}</p>
      <el-input v-model="replyText" type="textarea" :rows="4" placeholder="输入回复内容..." />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" :loading="replySubmitting" @click="handleReply">确定回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'

const list = reactive([])
const loading = ref(false)
const keyword = ref('')
const page = reactive({ current: 1, size: 10, total: 0 })

const replyVisible = ref(false)
const replySubmitting = ref(false)
const replyText = ref('')
const replyTarget = reactive({})

onMounted(fetchList)

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/admin/comments', {
      params: { page: page.current, size: page.size, keyword: keyword.value || undefined }
    })
    list.splice(0, list.length, ...(res.data?.records || []))
    page.total = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function openReply(row) {
  Object.assign(replyTarget, row)
  replyText.value = row.reply || ''
  replyVisible.value = true
}

async function handleReply() {
  replySubmitting.value = true
  try {
    await request.put(`/admin/comments/${replyTarget.id}`, { reply: replyText.value })
    ElMessage.success('回复成功')
    replyVisible.value = false
    fetchList()
  } finally {
    replySubmitting.value = false
  }
}

async function handleDelete(id) {
  await request.delete(`/admin/comments/${id}`)
  fetchList()
}
</script>
