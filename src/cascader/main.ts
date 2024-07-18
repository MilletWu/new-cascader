export interface CascaderProps {
  // 配置项 配置各种功能 如清空、懒加载等
  props?: Props
  // 数据
  options?: CascaderOption[]
  // 配置清空
  clearable?: boolean
  // input框的值
  modelValue?: string
  // 分隔符
  separator?: string
  // 配置input框的占位符
  inputPlaceholder: string
  // 是否开启搜索
  filterable: boolean
}

// 数组中每个对象的参数配置
export interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  leaf?: boolean
  level?: number
  selected?: boolean
  checked?: boolean
}

export interface CascaderPanelProps {
  // 配置项 配置各种功能 如清空、懒加载等
  props?: Props
  // 数据
  options?: CascaderOption[]
}
// 配置项
interface Props {}
