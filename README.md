# 宝宝食堂 🍼

给女朋友做的专属点餐小系统:收藏各种菜品,像外卖一样点单,做的每一单都有记录。

## 功能

- **点餐**:菜品分类导航,菜品卡片(大 Emoji 图标、名称、描述、已售份数、价格 mk),加入购物车,底部购物车栏可展开明细,一键下单
- **下单成功页**:展示订单金额与明细,一键返回点餐
- **改菜单**:菜品与分类的增删改(Emoji 图标选择器、价格、描述),删除有确认提示
- **订单**:按时间记录每一单,支持"待开饭 / 已完成"状态切换

## 技术栈

Vue 3 + Vue Router + Vite + Tailwind CSS v4 + Phosphor Icons。数据全部存在浏览器 `localStorage`,无需后端。

## 运行

```bash
npm install
npm run dev      # 开发,默认 http://localhost:5173
npm run build    # 生产构建
```

首次打开会自动写入示例菜单(4 个分类、11 道菜),在"改菜单"里可以随意修改。想彻底重置数据:浏览器控制台执行 `localStorage.removeItem('baobao-canteen-v1')` 后刷新。
