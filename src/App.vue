<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Cascader from './cascader/main.vue'
import axios from 'axios'
import type { CascaderOption } from './cascader/main'
const options = reactive([])
const inputValue = ref('')
const change = ({ newVal }) => {
  // console.log('change:', newVal)
}
const finallyx = ({ newVal }) => {
  // console.log('finally:', newVal)
}

const close = () => {
  console.log('close')
}

const getData = async (value, level) => {
  const res = await axios({
    url: 'https://wxtest.jwsoft.info/backapi/api/His/Crypto',
    data: {
      AccessKey: 'pau7xke2zf0py397ubi6wic8rh0mqv5z',
      OrgCode: '0000',
      OrgName: '内置机构',
      SysId: '607',
      DeptCode: '101',
      DeptName: '内科门诊',
      UserCode: '1001',
      UserName: '刘贝贝',
      RltType: '1',
      FunctionCode: '60000012000',
      NodeName: 'ACT_getAdminiDivisionByParentcode',
      Connect: '',
      Parament: {
        mainData: {
          parentcode: value,
          regionlevel: level
        }
      }
    },
    method: 'POST'
  })
  return res
}
onMounted(async () => {
  const res = (await getData('0', '1')).data.data
  options.push(...res)
})
const lazyLoad = async (item: CascaderOption): Promise<CascaderOption[]> => {
  const { value, level } = item

  return new Promise<CascaderOption[]>(async (resolve, reject) => {
    if (value && level) {
      const res = (await getData(value, level + 1)).data
      if (res.code == -1) {
        reject(res)
      }
      if (res.data.length == 0) {
        item.leaf = true
      }

      if (level == 4) {
        res.data.forEach((item1: CascaderOption) => {
          item1.leaf = true
        })
      }

      let children = res.data
      resolve(children)
    }
  })
}
const lazyCallBack = (crruent: CascaderOption, result: CascaderOption[]) => {
  crruent.children = result
}
</script>

<template>
  {{ inputValue }}
  <Cascader
    :options="options"
    separator="-"
    :clearable="true"
    v-model="inputValue"
    panel-height="204px"
    :lazy="true"
    :lazy-load="lazyLoad"
    :lazy-call-back="lazyCallBack"
    :filterable="true"
    @change="change"
    @finally="finallyx"
    @close="close"
  />
</template>
