# 自定义流程图

    封装了基础的开始模块、结束模块、分支模块 和基础样式
    允许外部添加自己的节点、表单 配置点击菜单 以及逻辑

![演示](https://img-blog.csdnimg.cn/direct/cbc545c322044b69a4d0941aecafc45d.png#pic_center)

    使用方法:

    下载dist/index.js并导入到项目中

    或者

    npm i yt-workflow

```javascript
// 借助于element-ui作为UI框架 请先有安装Elment的情况 这边不打包element进去了 因为会体积会从80-90KB 并且没法优化 变成1M多
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import WorkFlow from "@/assets/index.js";
Vue.use(WorkFlow, {
  //创建完节点立即打开抽屉
  createPopupImmediately: true,
  // 配置可选下拉项 也可以通过this.$factory.resetDataFields(对象) 设置
  dataFields: {
    submitter: { name: "提交人", conditions: ["属于", "不属于"], values: [{ label: "123", value: "123" }], single: false },
  },
});
let factory=Vue.prototype.$factory
// 下面是开放的方法
 /**
   * @description: 注册类型
   * @param {*} typeName 类型名称
   * @param {*} typeValue 类型值
   * @param {*} color 标题颜色
   * @param {*} icon 图标
   * @return {*}
   */
  rigsterType(typeName, typeValue, color = "rgb(230, 162, 60)", icon = "", btn_class = "")
// 创建自定义的节点
/**
   * @description: 创建自定义的节点
   * @param {*} filename 节点组件名称
   * @param {*} view  节点组件
*/
  createCustomNodeComponent(filename, view)

/**
   * @description: 节点创建
   * @param {number} type 节点类型
   * @param {string} nodeName 渲染组件的标题
   * @param {string} filename 节点渲染的组件名称
   * @param {string} form 节点渲染的表单
   * @param {object} setting 返回节点nodeConfig.setting的结构
   * @param {function} textSetting 文字处理
   * @param {function} saveSetting 保存前校验
   * @return {*}
   */
  createNode(type, setting, textSetting, saveSetting, nodeName = "节点", filename = "Normal", form = "NodeForm")
  // 返回的结构
   {
      filename,
      type,
      form,
      getStruct(fatherID, childNode, level) {
        return {
          nodeName,
          error: true,
          type,
          nodeId: getUUID(),
          setting,
          childNode,
          fatherID,
          level,
        };
      },
      handleText(nodeConfig) {
        let nodeSetting = nodeConfig.setting;
        let text = textSetting(nodeSetting);
        if (Array.isArray(text)) {
          return (text.length > 0 && text) || ["暂无配置"];
        }
        return ["暂无配置"];
      },
      beforeSave(nodeConfig) {
        let nodeSetting = nodeConfig.setting;
        return saveSetting(nodeSetting);
      },
    };

  /**
   * @description: 注册自定义节点的 node数据结构和它对应的表单
   * @param {*} type 类型
   * @param {*} node 节点数据
   * @param {*} view 节点组件
   */
  registerComponent(type, node, view)

  /**
   * @description: 重置下拉选项数据
   * @param {*} dataFields 对象
   * @return {*}
   */
  resetDataFields(dataFields)
//
```

## 使用示例

```javascript
<template>
  <div>
    <work-flow
      header
      :fullscreen="true"
      height="600px"
      header-height="60px"
      ref="flow"
    >
      <!-- <template #header>
        自定义header
      </template> -->
    </work-flow>
  </div>
</template>

<script>
export default {
  name: "App",
  methods: {
    flowMethod() {
      // 从文件导入数据
      this.$refs.flow.importData();
      // 直接赋值数据
      this.$refs.flow.loadData(data);
      // 导出数据结构
      this.$refs.flow.exportStruct();
      // 导出数据为文件
      this.$refs.flow.exportData();
      // 校验数据
      this.$refs.flow.validate();
      // 缩放视图 0变小 1增大 或者zoomSize(0,目标值)
      this.$refs.flow.zoomSize(0);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>

```

## 注册一个自定义组件的示例

```javascript
import CeshiForm from "./views/ceshiForm";
let factory = Vue.prototype.$factory;
let nodeType = factory.nodeType;
// 自定义类型文字 节点头颜色 图标
factory.rigsterType("测试", 10, "red", require("@/assets/1.jpeg"));
factory.registerComponent(
  nodeType.测试,
  factory.createNode(
    nodeType.测试,
    // setting数据
    {
      id: 1,
    },
    // 显示文字处理
    (config) => {
      if (config.id == 1) return ["123", "456"];
      return [];
    },
    // 保存前校验
    (config) => {
      if (config.id == 1) return true;
      return false;
    },
    // 节点名称
    "测试节点",
    // 节点文件 默认有Normal 需要定制自己createCustomNodeComponent引入
    "Normal", // 使用默认节点
    // 表单名称
    "CeshiForm"
  ),
  // 使用表单的vue
  CeshiForm
);
```

```javascript
// ceshiForm.vue
<template>
  <el-form
    class="form"
    label-position="top"
  >
    <el-form-item label="id">
      <el-input v-model="setting.id" />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/direct/33439015e6614c5dbb69bac08075d279.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/direct/43e6b4f07bc048e2879621804fe7b529.png)

## 自定义的表单 Vue 会自动混入的 mixin

```javascript
export default {
  mixName: "form",
  // config 配置 nodeType 节点类型字典
  inject: ["config", "nodeType"],
  props: ["value"],
  model: {
    prop: "value",
    event: "input",
  },
  computed: {
    // 节点数据 整体
    approverConfig: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    // 可用的配置 创建node时写入的setting
    setting: {
      get() {
        return this.approverConfig.setting;
      },
      set(value) {
        this.approverConfig.setting = value;
      },
    },
  },
};
```

## 自定义节点会混入的 mixins

```javascript
import addNode from "../components/AddNode";
export default {
  mixName: "node",
  components: {
    // 解决递归循环依赖的问题
    nodeWrap: () => import("../components/NodeWrap"),
    addNode,
  },
  props: ["isTried", "value"],
  model: {
    prop: "value",
    event: "input",
  },
  emits: ["openDrawer"],
  // getFlatRoot 获取扁平化后的节点数据
  // openDrawer 打开抽屉 传参(nodeConfig)
  // nodeType 类型字典列表
  // config 配置情况
  inject: ["getFlatRoot", "openDrawer", "nodeType", "config"],
  computed: {
    nodeConfig: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  mounted() {
    if (this.value == undefined) {
      throw Error("无绑定v-model 请绑定");
    }
    if (this.nodeConfig.type != this.nodeType.条件分支) {
      this.nodeConfig.error = !this.vaildError(this.nodeConfig);
    }
  },
  methods: {
    // 校验保存
    vaildError(item) {
      return this.$factory.getTypeBeforeSave(item.type, item);
    },
    // 设置节点文字
    setApproverStr() {
      let str = this.$factory.getTypeTextHandle(this.nodeConfig.type, this.nodeConfig);
      return str;
    },
    // 设置条件节点文字
    setConditionStr(item) {
      let str = this.$factory.getTypeTextHandle(item.type, item);
      return str;
    },
    // 删除节点
    delNode() {
      let fatherID = this.nodeConfig.fatherID;
      // 还需要更换fatherID 否则删除的时候还会找旧的father节点 如果旧节点被删了呢
      if (this.nodeConfig.childNode) {
        this.nodeConfig.childNode.fatherID = fatherID;
        this.$emit("input", this.nodeConfig.childNode);
      } else {
        // 处理没有下级的情况 需要拿到Root根节点数据向下找 如果他没上级不操作 有上级移除本级
        // 改成平铺后处理就方便了
        let flatRoot = this.getFlatRoot();
        if (!fatherID) {
          throw Error("这个是根节点无法删除！");
        } else {
          let father = flatRoot[fatherID];
          father.childNode = null;
        }
      }
    },
  },
};
```

## 对节点不满意的话 可以通过 registerComponent 覆盖 自己注册所有节点 但是不建议覆盖条件分支、条件、删除块的类型
