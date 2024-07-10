/*
 * @Author: 羊驼
 * @Date: 2023-04-27 14:02:51
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-06-21 15:34:22
 * @Description: 类型生成以及配置
 */
import { getUUID, NodeRecord } from "./config";
import nodeMix from "../node/mixin";
import formMix from "../form/mixin";
/**
 * @description: 类型生成
 * @param {*}
 * @return {*}
 */
export default class TypeFactory {
  // 收集type类
  factory = {};
  nodeType = null;
  app = null;
  nodeFilesList = new Set();
  config = null;
  constructor(nodeType, app, config) {
    this.nodeType = nodeType;
    this.app = app;
    this.config = config;
  }

  /**
   * @description: 创建自定义的节点
   * @param {*} filename 节点组件名称
   * @param {*} view  节点组件
   */
  createCustomNodeComponent(filename, view) {
    let { app, nodeFilesList } = this;
    if (!filename) throw Error(`自定义节点无效传参 组件名称：${filename}`);
    if (!view) throw Error(`自定义节点无效传参 组件内容`);
    if (nodeFilesList.has(filename)) throw Error("该节点组件名称已被注册过了");
    nodeFilesList.add(filename);
    let mix = view.mixins && view.mixins.find((x) => x.mixName == "node");
    if (!mix) {
      view.mixins = (view.mixins && view.mixins.concat(nodeMix)) || [nodeMix];
    }

    app.component(filename, view);
  }

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
  createNode(type, setting, textSetting, saveSetting, nodeName = "节点", filename = "Normal", form = "NodeForm") {
    if (type === undefined) {
      throw Error(`未注册类型:${type}`);
    }
    if (!this.nodeFilesList.has(filename)) {
      throw Error(`未注册节点Vue组件 ${filename}`);
    }
    if (!setting) {
      throw Error("节点配置不能为空");
    }
    if (typeof textSetting != "function" || typeof saveSetting != "function") {
      throw Error("传入参数不是函数");
    }
    return {
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
  }

  /**
   * @description: 注册自定义节点的 node数据结构和它对应的表单
   * @param {*} type 类型
   * @param {*} node 节点数据
   * @param {*} view 节点组件
   */
  registerComponent(type, node, view, setting = null) {
    let { factory, app } = this;
    if (type === "" || type == undefined) throw Error("无效注册类型:" + type);
    if (!node) throw Error("传入注册节点为空");
    factory[type] = node;
    if (setting) {
      NodeRecord[type] = {
        type,
        label: setting.name,
        icon: setting.icon || require("../images/节点.png"),
        class: setting.btnClass,
      };
    }
    if (view) {
      let mix = view.mixins && view.mixins.find((x) => x.mixName == "form");
      if (!mix) {
        view.mixins = (view.mixins && view.mixins.concat(formMix)) || [formMix];
      }
      app.component(node.form, view);
    }
  }

  /**
   * @description: 获取结构
   * @param {*}
   * @return {*}
   */
  getStruct(fatherID, type, childNode, level, priorityLevel) {
    if (this.factory[type]) {
      return this.factory[type].getStruct(fatherID, childNode, level, priorityLevel);
    } else {
      throw Error("无效type类型:" + type);
    }
  }

  /**
   * @description: 获取文字处理方式
   * @param {*}
   * @return {*}
   */
  getTypeTextHandle(type, nodeConfig) {
    return (this.factory[type] && this.factory[type].handleText(nodeConfig)) || "";
  }

  /**
   * @description: 保存前处理
   * @param {*}
   * @return {*}
   */
  getTypeBeforeSave(type, nodeConfig) {
    return this.factory[type] && this.factory[type].beforeSave(nodeConfig);
  }

  /**
   * @description: 获取节点组件名称
   * @param {*}
   * @return {*}
   */
  getTypeComponentName(type) {
    return this.factory[type] && this.factory[type].filename;
  }

  /**
   * @description: 获取表单组件名称
   * @param {*}
   * @return {*}
   */
  getFormComponentName(type) {
    return this.factory[type] && this.factory[type].form;
  }

  /**
   * @description: 重置下拉选项数据
   * @param {*} dataFields 对象
   * @return {*}
   */
  resetDataFields(dataFields) {
    this.config.dataFields = dataFields;
    this.factory[this.nodeType.条件].setMap(dataFields);
  }

  /**
   * @description: 批量注册组件 如果类型存在 直接覆盖
   * @param {Array<object>} custom
   * @return {*}
   */
  batchRigster(custom) {
    let { nodeType, config } = this;
    for (let { viewComponent, nodeComponent, nodeName = "节点", type, setting, textHandle, saveHandle } of custom) {
      if (!type || !type.name || type.value === undefined) {
        throw Error("字段type存在错误");
      }
      let { name, value, color = "rgb(230, 162, 60)", icon, btnClass } = type;
      for (let key in nodeType) {
        if ((key != type.name && nodeType[key]) === value) {
          throw Error(`${key}已经存在该类型值:${value}`);
        }
      }
      this.nodeType[name] = value;
      config.headerColor[nodeType[name]] = color;
      // if (!["开始", "结束", "条件", "条件分支"].includes(name)) {
      //   config.addNodesOptions = [
      //     {
      //       type: value,
      //       label: name,
      //       icon: icon || require("../images/节点.png"),
      //       class: btnClass,
      //     },
      //   ].concat(config.addNodesOptions);
      // }

      if (!viewComponent) {
        throw Error(`${type.name}不存在表单组件`);
      }
      let filename = (nodeComponent && nodeComponent.name) || "Normal";
      nodeComponent && this.createCustomNodeComponent(filename, nodeComponent);
      let node = this.createNode(value, setting, textHandle, saveHandle, nodeName, filename, viewComponent.name);
      this.registerComponent(value, node, viewComponent, type);
    }
  }

  /**
   * @description: 设置添加类型的选项
   * @param {NodeType[]} types 类型数组
   * @return {*}
   */
  setAddOptions(types) {
    let { nodeType } = this;
    let options = [];
    for (let item of types) {
      if ([nodeType.开始, nodeType.结束].includes(item)) continue;
      NodeRecord[item] && options.push(NodeRecord[item]);
    }
    this.config.addNodesOptions = options;
  }
}
