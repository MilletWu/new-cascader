## Cascader 组件接口文档

### `CascaderProps` 接口

描述了 Cascader 组件的属性配置。

|      参数名      |                     描述                     |       类型       | 默认值  |
| :--------------: | :------------------------------------------: | :--------------: | :-----: |
|      props       |          配置项，用于各种功能的设置          |      Props       |    -    |
|     options      |           数据，每个选项的配置信息           | CascaderOption[] |    -    |
|    clearable     |               是否显示清空按钮               |     boolean      |  false  |
|    modelValue    |            v-model绑定输入框的值             |      string      |    -    |
|    separator     |                    分隔符                    |      string      |    -    |
| inputPlaceholder |                输入框的占位符                |      string      | 请选择  |
|    filterable    |               是否开启搜索功能               |     boolean      |  false  |
|   panelHeight    | 自定义面板高度, 需要带单位,min-height：204px |      string      | '204px' |

### `CascaderOption` 接口

描述了 Cascader 组件选项的配置。

|  参数名  |           描述           |       类型       | 默认值 |
| :------: | :----------------------: | :--------------: | :----: |
|  value   |         选项的值         | string\| number  |   -    |
|  label   |      选项显示的文本      |      string      |   -    |
| children | 子选项数组，用于多级联动 | CascaderOption[] |   -    |
| disabled |      是否禁用该选项      |     boolean      | false  |
|   leaf   |      是否是叶子节点      |     boolean      | false  |
|  level   |           层级           |      number      |   -    |
| selected |         是否选中         |     boolean      | false  |
| checked  |         是否勾选         |     boolean      | false  |

### `Events`

Cascader 组件触发以下事件，可以通过 `v-on` 或 `@` 监听：

| 事件名  |           描述           |   返回值   | 参数 |
| :-----: | :----------------------: | :--------: | :--: |
| finally | 在输入框值最终确认后触发 | { newVal } |  -   |
| change  | 在输入框值发生变化时触发 | { newVal } |  -   |
|  close  |     在面板关闭时触发     |     -      |  -   |

### `示例用法`

```typescript
import { CascaderProps, CascaderOption } from './main'

// 使用 CascaderProps
const props: CascaderProps = {
  props: {
    // 配置项
  },
  options: [
    {
      value: '1',
      label: 'Option 1',
      children: [
        { value: '1-1', label: 'Option 1-1' },
        { value: '1-2', label: 'Option 1-2' }
      ]
    },
    {
      value: '2',
      label: 'Option 2',
      children: [
        { value: '2-1', label: 'Option 2-1' },
        { value: '2-2', label: 'Option 2-2' }
      ]
    }
  ],
  clearable: true,
  modelValue: '1-2',
  separator: '/',
  inputPlaceholder: '请选择',
  filterable: true
}

// 示例使用组件的事件监听
props.onFinally = (event) => {
  console.log('Input value finally confirmed:', event.newVal)
}

props.onChange = (event) => {
  console.log('Input value changed:', event.newVal)
}

props.onClose = () => {
  console.log('Cascader panel closed.')
}
```
