/*
 * @Author: 羊驼
 * @Date: 2024-05-20 11:31:41
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-22 17:31:17
 * @Description: file content
 */
import index from "./index.vue";
import TypeFactory from "./utils/factory";
import { NodeType, FlowConfig } from "./utils/config";
import Normal from "./node/Normal";
import BranchNode from "./node/Branch";
import Branch from "./type/branch";
import Condition from "./type/condition";
import Start from "./type/start";
import DeleteBlock from "./type/skip";
import End from "./type/end";
import NodeForm from "./form/NodeForm";
import ConditionForm from "./form/ConditionForm";

export default {
  install(app, config) {
    let factory = new TypeFactory(NodeType, app, FlowConfig);
    app.prototype.$factory = factory;
    factory.createCustomNodeComponent("Normal", Normal);
    factory.createCustomNodeComponent("Branch", BranchNode);

    let condition = new Condition();
    condition.setMap(FlowConfig.dataFields);
    factory.registerComponent(NodeType.开始, new Start(), NodeForm);
    factory.registerComponent(NodeType.结束, new End());
    factory.registerComponent(NodeType.删除块, new DeleteBlock());
    factory.registerComponent(NodeType.条件分支, new Branch());
    factory.registerComponent(NodeType.条件, condition, ConditionForm);
    app.component("work-flow", index);
    if (config) {
      config.dataFields && Reflect.set(FlowConfig, "dataFields", config.dataFields);
      FlowConfig.createPopupImmediately = config.createPopupImmediately;
      config.custom && Array.isArray(config.custom) && factory.batchRigster(config.custom);
      if (config.condition) {
        let { textHandle, saveHandle } = config.condition;
        if (textHandle) {
          condition.handleText = textHandle;
        }
        if (saveHandle) {
          condition.beforeSave = saveHandle;
        }
      }
    }
  },
};
