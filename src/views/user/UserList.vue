<template>
  <div class="page-container">
    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="role" label="角色" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <span v-if="row.username !== 'admin'">
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="编辑用户" v-model="dialogVisible" width="400px">
      <el-form :model="editForm" label-width="60px">
        <el-form-item label="昵称"><el-input v-model="editForm.nickname" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" style="width:100%">
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
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
const editForm = reactive({ id: null, nickname: '', role: 'admin' })

onMounted(fetchList)

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/admin/users')
    list.splice(0, list.length, ...(res.data || []))
  } finally { loading.value = false }
}

function openEdit(row) {
  editForm.id = row.id; editForm.nickname = row.nickname; editForm.role = row.role
  dialogVisible.value = true
}

async function handleSave() {
  await request.put(`/admin/users/${editForm.id}`, { nickname: editForm.nickname, role: editForm.role })
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchList()
}

async function handleDelete(id) {
  await request.delete(`/admin/users/${id}`)
  fetchList()
}
</script>
