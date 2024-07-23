<script setup lang="ts">
import { onMounted, reactive, ref, watchEffect } from 'vue'
import Cascader from './hwj-biz-cascader/main.vue'
import Region from './hwj-biz-region/main.vue'
import axios from 'axios'

import type { CascaderOption } from './cascader/main'
const options = reactive([])

const change = (newVal) => {
  // console.log('change:', modelV1.value)
}

const finallyx = (newVal) => {
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
const modelV = ref(['120000000000', '120100000000', '120101000000', '120101003000', '120101003004'])
const setModev = () => {
  modelV.value.splice(0)
  modelV.value = ['140000000000', '140300000000', '140303000000', '140303004000']
}
const setModev1 = () => {
  Object.assign(modelV1.value, {
    provinceName: '山西省',
    cityName: '阳泉市',
    areaName: '平定县',
    provinceCode: '140000000000',
    cityCode: '140300000000',
    areaCode: '140321000000'
  })
}

const modelV1 = ref({
  provinceCode: '120000000000',
  provinceName: 'string',
  cityCode: '120100000000',
  cityName: 'string',
  areaCode: '120101000000',
  areaName: 'string'
})
</script>

<template>
  <br />
  <Cascader
    :options="options"
    separator="-"
    :clearable="true"
    v-model="modelV"
    panel-height="204px"
    :lazy="true"
    :lazy-load="lazyLoad"
    :lazy-call-back="lazyCallBack"
    :filterable="true"
    width="400px"
    @change="change"
    @finally="finallyx"
    @close="close"
  />
  {{ modelV1 }}
  <Region
    :options="options"
    separator="-"
    :clearable="true"
    v-model="modelV1"
    panel-height="204px"
    :lazy="true"
    :lazy-load="lazyLoad"
    :lazy-call-back="lazyCallBack"
    :filterable="true"
    width="400px"
    @change="change"
    @finally="finallyx"
    @close="close"
  />
  <button @click="setModev">setModev</button>
  <button @click="setModev1">setModev1</button>
</template>
