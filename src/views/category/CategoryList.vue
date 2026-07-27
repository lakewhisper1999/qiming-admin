<template>
  <div class="page-container">
    <el-button type="primary" style="margin-bottom:16px" @click="openForm()">新增分类</el-button>

    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" width="200">
        <template #default="{ row }">
          <el-input v-if="row.editing" v-model="row._name" size="small" @keyup.enter="saveRow(row)" @blur="saveRow(row)" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="editName(row)">重命名</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 Dialog -->
    <el-dialog title="新增分类" v-model="dialogVisible" width="400px">
      <el-input v-model="newName" placeholder="分类名称" @keyup.enter="handleCreate" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
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
const dialogVisible = ref(false)
const newName = ref('')

onMounted(fetchList)

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/admin/categories')
    const data = (res.data || []).map(item => ({ ...item, editing: false, _name: item.name }))
    list.splice(0, list.length, ...data)
  } finally { loading.value = false }
}

function openForm() { dialogVisible.value = true; newName.value = '' }

async function handleCreate() {
  if (!newName.value.trim()) return
  await request.post('/admin/categories', { name: newName.value.trim() })
  ElMessage.success('新增成功')
  dialogVisible.value = false
  fetchList()
}

function editName(row) { row.editing = true; row._name = row.name }

async function saveRow(row) {
  row.editing = false
  if (row._name === row.name) return
  await request.put(`/admin/categories/${row.id}`, { name: row._name })
  fetchList()
}

async function handleDelete(id) {
  await request.delete(`/admin/categories/${id}`)
  ElMessage.success('删除成功')
  fetchList()
}
</script>
