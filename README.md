# 自定义流程图

    封装了基础的开始模块、结束模块、分支模块 和基础样式
    允许外部添加自己的节点、表单 配置点击菜单 以及逻辑

![演示](https://img-blog.csdnimg.cn/direct/cbc545c322044b69a4d0941aecafc45d.png#pic_center)

    使用方法:
    
    下载dist/index.js并导入到项目中
    
    或者
    
    cnpm i yt-workflow

```javascript
// 借助于element-ui作为UI框架 请先有安装Elment的情况 这边不打包element进去了 因为会体积会从80-90KB 并且没法优化 变成1M多
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Definition from "./plugins/Flow/Definition";
Vue.use(ElementUI);
Vue.use(WorkFlow, {
  //创建完节点立即打开抽屉
  createPopupImmediately: false,
  // 配置可选下拉项 也可以通过this.$factory.resetDataFields(对象) 设置
  dataFields: {
    submitter: { name: "提交人", conditions: ["属于", "不属于"], values: [{ label: "123", value: "123" }], single: false },
    submitter2: {
      name: "提交人2",
      conditions: ["属于", "不属于"],
      values: [
        {
          label: "123",
          children: [
            { label: "456", value: "456" },
            { label: "789", value: "789" },
          ],
        },
      ],
      single: true,
    },
  },
  // 自定义节点
  custom: [Definition],
  // 重写条件的 保存和文字处理
  condition: {
    textHandle: (setting) => {
      return ["1"];
    },
    saveHandle: (setting) => {
      return true;
    },
  },
});
let factory = Vue.prototype.$factory;
// 下面是开放的方法
/**
 * @description: 重置下拉选项数据
 * @param {*} dataFields 对象
 * @return {*}
 */
resetDataFields(dataFields);
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
      drawer-width="400px"
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
// "./plugins/Flow/Definition/index.js"
import view from "./index.vue";
export default {
  nodeName: "定义",
  viewComponent: view,
  nodeComponent: null,
  // 允许覆盖同名
  type: {
    name: "定义",
    value: 10,
    color: null,
    icon: null,
    btnClass: "",
  },
  setting: {
    id: 1,
  },
  textHandle: (config) => {
    return ["暂无配置"];
  },
  saveHandle: (config) => {
    return true;
  },
};
```

```javascript
// "./plugins/Flow/Definition/index.vue"
<template>
  <el-form
    class="yt-form"
    label-position="top"
  >
    {{setting.id}}
  </el-form>
</template>

<script>
export default {
  name: "definitionForm",
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

## 对节点不满意的话 可以通过一开始的 custom 去覆盖对应的 type

## 优化中的项目 所以版本提交改动会多

演示使用该项目的demo地址：

[地址]: https://github.com/codecnmc/simple-server

