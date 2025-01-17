// 配置项
interface Props {
  valueKey: string
  labelKey: string
  childrenKey: string
}
export interface CascaderProps {
  setProps?: Props
  // 数据
  options: CascaderOption[]
  // 配置清空
  clearable?: boolean
  // input框的值
  modelValue: modelObj
  // 分隔符
  separator?: string
  // 配置input框的占位符
  inputPlaceholder?: string
  // 是否开启搜索
  filterable?: boolean
  // 自定义面板高度, 需要带单位
  panelHeight?: string
  // 是否开启懒加载
  lazy?: boolean
  // 懒加载函数lazy为true时开启
  lazyLoad?: LazyLoad
  lazyCallBack?: LazyCallBack
  // 配置宽度
  width?: string
}

// 数组中每个对象的参数配置
export interface CascaderOption {
  value?: string | number
  label?: string
  children?: CascaderOption[]
  disabled?: boolean
  leaf?: boolean
  level?: number
  selected?: boolean
  checked?: boolean
  [key: string]: any
}

export interface modelObj {
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  areaCode: string
  areaName: string
}

export type LazyCallBack = (cureent: CascaderOption, result: CascaderOption[]) => void
export type LazyLoad = (cureent: CascaderOption) => Promise<CascaderOption[]>
