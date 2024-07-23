<template>
  <div
    class="cascader-box"
    ref="cascaderBoxRef"
    tabindex="0"
    @keydown="handleKeydown"
    :style="{ width: width }"
  >
    <!-- Input 框-->
    <div
      class="input-box"
      :class="{ active: hasOpen }"
      ref="inputBoxRef"
      tabindex="0"
      @mouseenter="onInputBoxMouseEnter"
      @mouseleave="onInputBoxMouseLeave"
      @click="onInputBoxClick"
    >
      <input
        type="text"
        v-model="inputValue"
        ref="inputRef"
        :placeholder="inputPlaceholder"
        :readonly="!filterable"
      />
      <div class="btn-box">
        <!-- 清空 -->
        <span class="clear-btn iconfont icon-clear" v-show="hasClear" @click.stop="clear"></span>
        <!-- 箭头 表示状态 -->
        <Transition>
          <span
            v-show="true"
            class="arrow-icon-box iconfont icon-arrow"
            :class="{ 'arrow-return': hasOpen }"
          ></span
        ></Transition>
      </div>
    </div>
    <!-- 面板展示 -->
    <Transition name="fade">
      <div class="panel-list-box" v-show="hasOpen">
        <div class="panel-list-container" ref="panelListRef" v-show="!hasSearchPanel">
          <CascaderPanel
            :panelHeight="panelHeight"
            :options="panelOptions"
            @addPanel="addPanel"
            @submitData="submitData"
            @arrowLeft="handlePanelKeydown"
            @arrowRight="handlePanelKeydown"
            @enterSubmit="enterSubmit"
            :lazy="lazy"
            :lazy-load="lazyLoad"
            :lazy-call-back="lazyCallBack"
          />
          <template v-for="panelItem in paneShowList" :key="panelItem[labelKey]">
            <CascaderPanel
              :options="panelItem[childrenKey]"
              :panelHeight="panelHeight"
              @addPanel="addPanel"
              @submitData="submitData"
              @arrowLeft="handlePanelKeydown"
              @arrowRight="handlePanelKeydown"
              @enterSubmit="enterSubmit"
              :lazy="lazy"
              :lazyLoad="lazyLoad"
              :lazy-call-back="lazyCallBack"
            />
          </template>
        </div>

        <div
          class="search-panel panel-list-container"
          ref="searchPanelRef"
          v-if="filterable && hasSearchPanel"
        >
          <CascaderPanel
            :options="searchResult"
            :panelHeight="panelHeight"
            :set-props="setFilterableProps"
            :filterable="true"
            @addPanel="addPanel"
            @submitData="submitData"
            @enterSubmit="enterSubmit"
          />
        </div>

        <span class="decoration-icon"></span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import CascaderPanel from './components/cascader-panel.vue'
import './icon-class/iconfont.css'
import { CascaderProps, CascaderOption, ReturnData } from './main'
import { ref, computed, reactive, nextTick, watch } from 'vue'
import { useClickOutside } from './hooks/click-outside'
import { addLevel, addSelectedField } from './utils/index.ts'

const props = withDefaults(defineProps<CascaderProps>(), {
  // 默认不开启清空
  clearable: false,
  // 分隔符
  separator: '/',
  // input占位符
  inputPlaceholder: '请选择',
  filterable: false,
  panelHeight: '204px',
  lazy: false,
  setProps: () => ({
    valueKey: 'value',
    labelKey: 'label',
    childrenKey: 'children'
  }),
  width: '200px'
})
// 自定义数据字段
const { valueKey, labelKey, childrenKey } = props.setProps
// emits
const emits = defineEmits(['update:modelValue', 'finally', 'change', 'close'])
// 数据添加层级标识
const newOptions = reactive(props.options)

// 计算第一层面板的数据
const panelOptions = computed(() => {
  let options = addLevel(addSelectedField(newOptions))
  return reactive(options)
})

// 面板列表
const panelList = reactive<CascaderOption[]>([])
// 面板dom
const panelListRef = ref()
// 展示面板列表
const paneShowList = computed(() => {
  return panelList.filter((item) => item[childrenKey]?.length)
})
// 保存面板值
const hasOpenValue = ref(false)
// 面板是否展开
const hasOpen = computed({
  get() {
    return hasOpenValue.value
  },
  set(v) {
    if (hasOpen.value == v) return
    if (!v) {
      emits('close')
    }
    hasOpenValue.value = v
  }
})
// 过滤面板配置props
const setFilterableProps = {
  valueKey: 'searchName',
  labelKey: 'searchName',
  childrenKey: 'list'
}
// cascaderBox dom对象
const cascaderBoxRef = ref()

// inputBoxRef dom对象
const inputBoxRef = ref()
// input dom对象
const inputRef = ref<HTMLInputElement>()

// input-box 是否触发hover事件
let hasInputHover = ref(false)

// 旧的选中对象
let oldChecked: CascaderOption = { [valueKey]: '', [labelKey]: '', checked: false }

// 是否显示清空
const hasClear = computed(() => {
  // props.clear是否存在，是否为true,input-box是否触发hover,input是否存在值
  return props.clearable && inputValue.value && hasInputHover.value
})

// 最后选择的结果
const resultData = ref([])
const modelFlag = ref(false)
// input model 初始值
const inputModel = ref('')
//  input框初始值 v-model更改初始值不希望触发input search事件
const inputInitValue = computed({
  get() {
    return inputModel.value
  },
  set(v) {
    if (modelFlag.value) {
      emits('finally', { inputKey: v, valList: resultData.value })
      if (v != inputInitValue.value) {
        emits('change', { inputKey: v, valList: resultData.value })
        inputModel.value = v
        modelFlag.value = false
      }
    }
    // 更新
    if (v != inputInitValue.value) {
      inputModel.value = v
    }
  }
})

// input框展示的值
const inputValue = computed({
  get() {
    return inputInitValue.value
  },
  set(v) {
    emits('finally', { inputKey: v, valList: resultData.value })
    if (v != inputValue.value) {
      emits('change', { inputKey: v, valList: resultData.value })
      inputInitValue.value = v
      if (props.filterable && v?.trim() != '') {
        handleInputEnter(v as string)
      }
    }
    if (v?.trim() == '') {
      // 控制关闭
      hasSearchPanel.value = false
    }
  }
})
// 搜索结果
const searchResult = reactive<Record<string, unknown>[]>([])
// 是否展示搜索面板
const hasSearchPanel = ref(false)
// 搜索面板dom
const searchPanelRef = ref()
// input-box 移入事件处理
const onInputBoxMouseEnter = () => {
  if (!props.clearable) return
  hasInputHover.value = true
}

// input-box 移出事件处理
const onInputBoxMouseLeave = () => {
  if (!props.clearable) return
  hasInputHover.value = false
}
// input-box 单击事件处理
const onInputBoxClick = () => {
  hasOpen.value = true
}
// input-box 外部单击事件处理
const onInputBoxOutsideClick = () => {
  hasOpen.value = false
}
// 外部钩子
useClickOutside(cascaderBoxRef, onInputBoxOutsideClick)

//添加面板
const addPanel = ({ currentItem: panelItem, filterable }: ReturnData) => {
  // 如果是过滤面板则直接返回

  if (filterable) {
    resetSelected(searchResult, 0)
    return (panelItem.selected = true)
  }
  panelItem.selected = true
  // 先判断这个层级是否存在面板渲染
  const index = panelList.findIndex((item) => item?.level === panelItem?.level)
  // 如果新添加的面板与之前一致则不处理
  // if (panelList[index] == panelItem) return
  // 如果存在则替换旧层级面板
  if (index !== -1) {
    if (panelList[index] != panelItem) {
      // 重置所有样式
      resetSelected(panelList, index)
    } else {
      // 重置后面所有面板样式
      resetSelected(panelList, index + 1)
    }
    panelList.splice(index, 1, panelItem)
    // 清除后面所有面板
    panelList.splice(index + 1)
  } else {
    panelList.push(panelItem)
  }
}
// 重置所有面板样式
const resetSelected = (arr: any[], index: number) => {
  for (let i = index; i < arr.length; i++) {
    arr[i].selected = false
  }
}

// 数据提交
const submitData = ({ currentItem: panelItem, filterable }: ReturnData) => {
  oldChecked.checked = false
  panelItem.checked = true
  oldChecked = panelItem

  //定义返回的数据
  let newData = {
    [valueKey]: [] as any,
    [labelKey]: ''
  }
  // 如果没开启查询
  if (!filterable) {
    let separator = props.separator
    panelList.forEach((item) => {
      newData[valueKey].push(item[valueKey])
      newData[labelKey] += item[labelKey] + separator
    })

    // 去掉末尾的分隔符
    newData[labelKey] = newData[labelKey].slice(0, newData[labelKey].lastIndexOf(separator))
  } else {
    panelItem['searchList'].forEach((item: CascaderOption) => {
      newData[valueKey].push(item[valueKey])
    })
    newData[labelKey] = panelItem['searchName']
    // 重设面板选中
    resetPanel(newData[valueKey])
  }

  // 数组不为空
  if (resultData.value.length) {
    // 清空
    resultData.value.splice(0)
  }

  resultData.value.push(...newData[valueKey])
  // 关闭面板列表
  hasOpen.value = false
  hasSearchPanel.value = false
  emits('update:modelValue', resultData.value)
  setVmodelPanel(resultData.value)
  // 聚焦到面板
  nextTick(() => {
    props.filterable ? inputRef.value?.focus() : inputBoxRef.value?.focus()
  })
}

// 重设面板
const resetPanel = (list: string[]) => {
  // 重置样式
  resetSelected(panelList, 0)
  // 清空展示面板
  panelList.splice(0)
  oldChecked.checked = false
  let currentLevelItem = panelOptions.value
  let index = 0

  while (index < list.length) {
    const item = list[index]

    // 处理多层级情况
    if (currentLevelItem) {
      // 查找当前列表中匹配的项目
      let currentItem = currentLevelItem.find((option: CascaderOption) => option.value === item)

      if (currentItem) {
        currentItem.selected = true
        panelList.push(currentItem)

        // 如果是列表中的最后一个项目，则标记为已选中并更新 oldChecked
        if (index === list.length - 1) {
          currentItem.checked = true
          oldChecked = currentItem
        }

        // 更新 currentLevelItem 为当前找到的项目的子项目
        currentLevelItem = currentItem[childrenKey]
      } else {
        break // 如果未找到当前项目，退出循环
      }
    } else {
      break // 如果当前级别没有更深层级可供查找，退出循环
    }

    index++ // 准备处理下一个项目
  }
}

// 回车事件提交数据
const enterSubmit = ({ currentItem, filterable }: ReturnData) => {
  submitData({ currentItem, filterable })
}
type KeyDown = {
  direction: string
  currentItem: CascaderOption
}
// 当前组件键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key == 'ArrowDown') {
    hasOpen.value = true
    nextTick(() => {
      // 这边的children不是数据中的字段，而是dom操作
      if (props.filterable && hasSearchPanel.value) return searchPanelRef.value.children[0]?.focus()
      Array.from(panelListRef.value.children).forEach((item) => {
        item.focus()
      })
    })
  }
}
// 面板键盘事件处理
const handlePanelKeydown = ({ direction, currentItem }: KeyDown) => {
  const currentIndex = (currentItem.level as number) - 1
  let newIndex = currentIndex
  // 有子元素则能往右聚焦
  let hasRight = currentItem[childrenKey]?.length ? true : false
  // 层级不是第一层则能往左聚焦
  let hasLeft = currentItem.level != 1 ? true : false

  switch (direction) {
    case 'left':
      if (!hasLeft) break
      newIndex -= 1
      resetSelected(panelList, newIndex)
      break
    case 'right':
      if (!hasRight) break
      newIndex += 1
      break
  }

  // 如果index没有变化则返回
  if (newIndex == currentIndex) return
  const nextFocusItem = panelListRef.value.children[newIndex]
  nextTick(() => {
    nextFocusItem.focus()
  })
}
// 清空
const clear = () => {
  // 清空
  emits('update:modelValue', [])
  inputValue.value = ''
  resultData.value.splice(0)
  // 清空样式
  resetSelected(panelList, 0)
  // 清空展示面板
  panelList.splice(0)
  // 取消选中
  oldChecked.checked = false
  // 关闭
  hasOpen.value = false
  if (props.filterable) {
    hasSearchPanel.value = false
    searchResult.splice(0)
  }
}

// 搜索事件处理函数
const searchTree = (
  keyword: string,
  optionsTree: Record<string, unknown>[],
  searchKeys: string[] = [labelKey, 'phoneticCode']
): Record<string, unknown>[] => {
  if (!optionsTree.length) return []
  const resList: any[] = []
  const map = new Map()
  const includesMap = new Map()

  function setMap(searchList: any[], parent: any = null, parentName = '', parentList: any[] = []) {
    for (const item of searchList) {
      if (item?.disabled) continue
      item.parent = parent
      item.searchName = parentName ? parentName + props.separator + item[labelKey] : item[labelKey]
      item.searchList = parentList ? [...parentList, { ...item }] : [{ ...item }]
      map.set(item[valueKey], item)
      if (item[childrenKey] && item[childrenKey].length) {
        setMap(item[childrenKey], item, item.searchName, item.searchList)
      }
    }
  }
  setMap(optionsTree)

  for (const [_key, value] of map) {
    for (const searchKey of searchKeys) {
      if (value[searchKey] && value[searchKey].includes(keyword)) {
        includesMap.set(value[valueKey], value)
        break
      }
    }
  }

  for (const [_key, value] of includesMap) {
    // 查找父级在不在
    if (!value.parent) {
      setLeafNode(value[childrenKey])
      resList.push({ searchName: value.searchName, searchList: value.searchList })
      continue
    }
    const rootNode = getRootNode(value)
    setLeafNode(rootNode[childrenKey])
    resList.push({ searchName: rootNode.searchName, searchList: rootNode.searchList })
  }

  function setLeafNode(searchList: any[]) {
    if (!searchList?.length) return
    for (const item of searchList) {
      if (item[childrenKey] && item[childrenKey].length) {
        setLeafNode(item[childrenKey])
        continue
      }
      resList.push({ searchName: item.searchName, searchList: item.searchList })
    }
  }

  function getRootNode(data: Record<string, any>) {
    if (includesMap.get(data?.parent?.[valueKey])) {
      return getRootNode(data?.parent)
    }
    return data
  }

  return resList
}

// input 回车事件处理
const handleInputEnter = (searchKey: string) => {
  if (props.filterable) {
    // 搜索之前清空
    hasOpen.value = true
    searchResult.splice(0)
    const res = searchTree(searchKey as string, panelOptions.value)
    searchResult.push(...addSelectedField(res))
    searchResult.reverse()
    hasSearchPanel.value = true
  }
}

// v-model面板
const setVmodelPanel = (v: string | string[] | number[]) => {
  modelFlag.value = true
  let newInputValue = ''
  let separator = props.separator
  if (typeof v === 'string' || typeof v === 'number') {
    resetPanel([v])
  } else {
    resetPanel(v as string[])
  }

  panelList.forEach((item) => {
    newInputValue += item[labelKey] + separator
  })

  // 去掉末尾的分隔符
  newInputValue = newInputValue.slice(0, newInputValue.lastIndexOf(separator))
  // 更改初始化值不触发 搜索框
  inputInitValue.value = newInputValue
}

watch(
  panelOptions,
  () => {
    setVmodelPanel([...props.modelValue] as any[])
  },
  { once: true }
)
watch(
  computed(() => props.modelValue),
  (v) => {
    setVmodelPanel([...v] as any[])
  }
)
</script>
<style lang="scss" scoped>
$default-color: #dcdfe6;
$active-color: #409eff;

.cascader-box {
  box-sizing: border-box;
  position: relative;
  color: #606266;
  width: auto;
  outline: none;

  .input-box {
    box-sizing: border-box;
    padding: 1px 11px;
    border-radius: 5px;
    border: 1px solid #dcdfe6;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    cursor: pointer;

    input {
      box-sizing: border-box;
      padding: 0 2px;
      border: none;
      outline: none;
      width: 100%;
      height: 28px;
      font-size: 14px;
      color: #606266;
      overflow: hidden; /* 隐藏溢出的内容 */
      white-space: nowrap; /* 不换行 */
      text-overflow: ellipsis; /* 使用省略号显示溢出的内容 */
      cursor: pointer;
    }
    &:focus-within {
      border-color: $active-color;
    }

    .btn-box {
      position: relative;
      width: 14px;
      height: 28px;

      .clear-btn,
      .arrow-icon-box {
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: #fff;
        transform: translate(-50%, -50%) rotate(180deg);
      }
      .clear-btn {
        z-index: 2;
      }
      .arrow-icon-box {
        font-size: 12px;
        transition: all 0.4s;
      }
    }
  }
  .active {
    border-color: $active-color;
  }
  .panel-list-box {
    position: absolute;
    top: 50px;
    z-index: 2000;
    .panel-list-container {
      display: flex;
      border: 1px solid $default-color;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
      :deep(.cascader-panel) {
        border-left: 1px solid $default-color;
        &:first-child {
          border: none;
        }
      }
    }
    .decoration-icon {
      position: absolute;
      top: -4px;
      width: 10px;
      height: 10px;
      background: #fff;
      border: 1px solid $default-color;
      transform: rotate(45deg);
      border-top-left-radius: 2px;
      left: 35px;
      z-index: -1;
    }
  }
}

.iconfont {
  color: $default-color;
}
.arrow-return {
  transform: translate(-50%, -50%) rotate(360deg) !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
