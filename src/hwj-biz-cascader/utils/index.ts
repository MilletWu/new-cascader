// 添加层级
export const addLevel = (data: any, level = 1) => {
  return data.map((item: any) => {
    const newItem = { ...item, level }
    if (item.children) {
      newItem.children = addLevel(item.children, level + 1)
    }
    return newItem
  })
}

// 添加 selected checked字段
export const addSelectedField = (data: any, selected = false, checked = false, leaf = false) => {
  return data.map((item: any) => {
    const newItem = { ...item, selected, checked, leaf }
    if (item.children) {
      newItem.children = addSelectedField(item.children, selected, checked)
    }
    return newItem
  })
}
