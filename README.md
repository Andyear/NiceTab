# NiceTab

## 基础介绍
- 本项目是一个方便快捷管理浏览器标签页的浏览器插件。
- 取名 `NiceTab` 是希望它是一个用起来很 nice 的 tab 标签页管理工具（不过本人的UI和交互设计太差，只能凑合凑合了）。 
- 类似于 `OneTab`、`N-Tab` 等标签页管理插件，支持**谷歌Chrome**、**Firefox**、**微软Edge**等浏览器。
- 采用 `react` 语言，基于[wxt框架](https://wxt.dev/)开发（wxt框架内置 `vanilla | vue | react | svelte | solid` 语言的初始化模板）。
- UI直接使用了 `Ant Design` 这个常用的 UI 框架。

## 项目初衷
我本人有强迫症，浏览器标签页开多了就有点焦虑，而且想要在众多标签页中切换到指定的页面很费劲儿。   
有了 OneTab 之后，管理标签页非常方便，提升了效率也节省了内存。因此一直使用 OneTab 插件来管理浏览器标签页。   

经过一段时间对 OneTab 的使用体验，个人感觉有几个点不是特别顺手：
- 标签组虽然能重命名，但是导出后再导入就会丢失。
- 由于标签组重命名会丢失，所以我懒得花时间重命名，当标签组积累多了之后，很难找到指定的标签组。
- OneTab 插件图标右键菜单经常会出现好几个重复的OneTab菜单组，其中只有一个菜单组是能用的，但是你得挨个试才知道。
- 有时候我只是想要将一些标签页收藏进列表，并不想关闭它们，但是 OneTab 没有对应的设置项（其实这个只是我本人的体验感受，并不是 OneTab 的问题点，它的初衷就是想要关闭标签页来节省内存）。
- 还有就是，我想将某个标签组中的标签页移动到新的标签组，但是又没办法创建标签组，只能通过插件图标发送标签页到 OneTab 列表来创建新标签页。
- 。。。

基于上面几点原因，最终促使我开发了 NiceTab 这个插件，在借鉴 `OneTab`、`N-Tab` 等插件现有部分功能的基础上，添加了一些其他的功能。

## 功能介绍
- 支持分类、标签组、标签页管理，包括一键收集保存、恢复、星标、锁定、增删改查、拖拽排序等功能。
- 分类支持展开/收起，支持创建分类和标签组，方便移动其他标签组/标签页到新分类/新标签组。
- 支持多种插件格式的 **导入/导出** 功能，支持导出到本地。目前支持 `NiceTab`、`OneTab` 格式的交叉导入导出（比如：可选择导入OneTab格式并导出为NiceTab格式；或者将NiceTab格式导出为OneTab格式），后续可根据需求增加其他插件格式的导入导出功能。
- 支持皮肤主题切换，目前暂时设置了有限的几种主题色提供选择，后续可根据需求扩大选择范围。
- 支持多语言，目前暂时支持中英文切换 (非地道英语，期待英语大佬帮忙校正)。
- 支持回收站功能，回收站中的标签页可还原到标签列表或者彻底删除。标签列表和回收站支持根据分类和标签组归类合并，方便管理。
- 支持设置 `发送标签页时-是否自动关闭标签页`。
- 支持设置 `发送标签页时-是否打开NiceTab管理后台`。
- 类似 OneTab 插件，支持设置 `发送标签页时-是否发送固定标签页到NiceTab`。
- 类似 OneTab 插件，支持设置 `恢复标签页/标签组时-是否保留或删除标签页/标签组`。
- 类似 OneTab 插件，支持设置 `是否固定NiceTab管理后台`。
- 类似 OneTab 插件，支持一键发送 所有标签页、当前标签页、其他标签页、左侧标签页、右侧标签页。


## 使用
- 点击扩展图标，打开popup面板，显示当前已打开的标签页列表，可快速访问扩展管理后台，快速切换主题。
- 右击扩展图标，展示快捷操作菜单，可发送标签页到扩展管理后台。
- 打开**管理后台**，可进行语言切换和主题切换。
- 打开**管理后台 > 标签列表**页，查看已发送的标签页列表，支持分类和标签组管理。
- 打开**管理后台 > 设置**页，可保存扩展的偏好设置。
- 打开**管理后台 > 导入导出**页，可进行NiceTab和OneTab格式的标签页导入导出操作。
- 打开**管理后台 > 回收站**页，可查看和管理从标签列表页中删除的分类、标签组、标签页，并进行还原和删除操作。

## 参考链接
- [Chrome for Developers - Extensions > API 参考](https://developer.chrome.com/docs/extensions/reference/api?hl=zh-cn)
- [WXT 官网](https://wxt.dev/)
- [Ant Design](https://ant-design.antgroup.com/index-cn)
- [React Router](https://reactrouter.com/)
- [styled-components](https://styled-components.com/)
- [react-intl](https://formatjs.io/docs/react-intl)
- [pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop/about)
- [【干货】Chrome插件(扩展)开发全攻略](https://www.cnblogs.com/liuxianan/p/chrome-plugin-develop.html)


## 插件开发

- 依赖安装：`npm install`
- 启动插件服务：`npm run dev`
- 
**注意**：每个js文件都必须有 `export default` 默认导出，否则本地启动服务时会报错。
