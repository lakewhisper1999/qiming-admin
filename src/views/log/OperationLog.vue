<template>
  <div class="page-container">
    <div class="search-bar">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
        value-format="YYYY-MM-DD" @change="fetchList" />
      <el-input v-model="username" placeholder="操作人" style="width:160px" clearable @clear="fetchList" />
      <el-button type="primary" @click="fetchList">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="操作人" width="100" />
      <el-table-column prop="action" label="操作" width="120" />
      <el-table-column prop="target" label="目标" min-width="150" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="createdAt" label="时间" width="160" />
    </el-table>

    <el-pagination
      v-model:current-page="page.current" v-model:page-size="page.size" :total="page.total"
      :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
      style="margin-top:16px;justify-content:flex-end"
      @size-change="fetchList" @current-change="fetchList"
    />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '../../utils/request'

const list = reactive([])
const loading = ref(false)
const dateRange = ref([])
const username = ref('')
const page = reactive({ current: 1, size: 10, total: 0 })

onMounted(fetchList)

async function fetchList() {
  loading.value = true
  try {
    const params = { page: page.current, size: page.size, username: username.value || undefined }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await request.get('/admin/logs/operations', { params })
    list.splice(0, list.length, ...(res.data?.records || []))
    page.total = res.data?.total || 0
  } finally { loading.value = false }
}
</script>
