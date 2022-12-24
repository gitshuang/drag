import { handleActions } from 'redux-actions';
import actions from './action';
import { guid } from '../../utils'

const {
  updateShadowCard,
  updateLayout,
  updateGroupList,
  setManageList,
  getManageList,
  addDesk,
  batchDelect,
  batchMove,
  selectGroupActions,
  selectListActions,
  addGroup,
  delectGroup,
  renameGroup,
  stickGroup,
  moveTopGroup,
  moveBottomGroup,
  splitFolder,
  addService,
  getAllServicesByLabelGroup,
  setCurrentSelectWidgetMap,
  openBatchMove,
  closeBatchMove,
  setEditState,
  setCurrGroupIndex,
  editTitle,
  setEditonlyId,
  returnDefaultState,
  setDragInputState,
  emptySelectGroup,
  changeSiderState,
  getAllMenuList,
  moveSideCards,
  dropSideCards,
  updateManageList,
  dropSideCardsInGroup,
  updateCheckedCardList
} = actions;

const defaultState = {
  manageList: [],
  isEdit: false,
  isFocus: false,
  batchMoveModalDisplay: false,
  selectList: [], // 勾选的服务列表
  // selectWidgetList:[],
  selectGroup: [],
  currGroupIndex: 0,
  currentSelectWidgetMap: {},
  title: '',
  currEditonlyId: '',

  applicationsMap: {},
  // selectWidgetItem:true,
  allServicesByLabelGroup: {},

  dragState: true, // 是否可拖拽

  shadowCard:{}, //
  isSiderDisplay: true,  //左侧默认展开
  layout: {
		containerWidth: 1200,
		containerHeight: 200,
		calWidth: 175,
		rowHeight: 175,
		col: 6,
		margin: [ 10, 10 ],
		containerPadding: [ 0, 0 ]
  },
  currentHoveredTargetId:'',
  defaultLayout: {
		containerWidth: 1200,
		containerHeight: 200,
		calWidth: 175,
		rowHeight: 175,
		col: 6,
		margin: [ 10, 10 ],
		containerPadding: [ 0, 0 ]
  },
  checkedCardList: [],//左侧已选择元素数组
};

const findTreeById = (data, curId) => {
  let result;
  for (let i = 0, l = data.length; i < l; i += 1) {
    const menu = data[i];
    const { id, children } = menu;
    if (children && children.length) {
      result = findTreeById(children, curId);
    }
    if (result) {
      break;
    }
    if (id === curId) {
      result = menu;
      break;
    }
  }
  return result;
};
// 定义上下移动数组
function swapItems(arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
}
const defaultGroup = {
  widgetName: '',
  type: 1,
  children: [],
  isNew: true,
};

// 递归查找
let data;
function findById(manageList, id) {
  for (let i = 0; i < manageList.length; i++) {
    if (manageList[i].widgetId && manageList[i].widgetId === id) {
      data = manageList[i];
      break;
    } else {
      manageList[i].children && findById(manageList[i].children, id);
    }
  }
  return data;
}

function setDefaultSelected(manageList, applicationsMap) {
  manageList.forEach((da) => {
    if (da && da.type === 3) { // 表示服务和应用
      if (applicationsMap[da.serviceId]) {
        applicationsMap[da.serviceId].selected = '1';
      }
    } else if (da.children && da.children != 0) {
      setDefaultSelected(da.children, applicationsMap);
    }
  });
}

const reducer = handleActions({
  [updateCheckedCardList]: (state, { payload }) => {
    return {
      ...state,
      checkedCardList: payload
    }
  },
  [changeSiderState]: (state) => {
    return {
      ...state,
      isSiderDisplay: !state.isSiderDisplay
    };
  },
  [updateShadowCard]:(state,{payload:shadowCard}) => {
    return {
      ...state,
      shadowCard: shadowCard
    };
  },
  [updateLayout] : (state,{payload:layout}) => {
    return {
      ...state,
      layout: layout
    };
  },
  [updateGroupList]:(state,{payload:payload}) => {
    if(Object.prototype.toString.call(payload)=="[object Object]"&& payload.isEdit){//有些update不需要激活edit，所以传入的参数不同
      state.isEdit = payload.isEdit
      payload = payload.manageList
    }
    return {
      ...state,
      manageList: payload,
      checkedCardList:[],
      isEdit:state.isEdit
    };
  },
 
  [setManageList]: (state, { payload, error }) =>
    ({
      ...state,
      selectWidgetItem: true,
    }),
  // return state;

  [setDragInputState]: (state, { payload: dragState }) => ({
    ...state,
    dragState,
  }),
  [getManageList]: (state, { payload, error }) => {
    if (error) {
      return state;
    }
    // 更改了原有数据， 暂时无碍吧， 为了将数据的文件夹平铺到上一级
    const list = payload.workList;
    list.forEach(item => {
      item.children.forEach((list, index) => {
        if (list.type === 2) {
          const arr = list.children;
          item.children.splice(index, 1);
          arr.forEach((data, key) => {
            data.parentId = item.widgetId;
            item.children.splice(index + key, 0, data);
          });
        }
      });
    });
    return {
      ...state,
      manageList: [...list],
      currEditonlyId: '',
    };
  },
  [addDesk]: (state, { payload: data }) => {
    const { dataList, parentId } = data;
    dataList.forEach((da) => {
      da.parentId = parentId;
      da.type = 3;
      da.size = 1;
      da.widgetId = da.serviceId;
      da.widgetName = da.serviceName;
      da.serviceCode = da.serviceCode;
      da.icon = da.serviceIcon;
      da.size = da.widgetTemplate.size;
      da.serviceType = da.widgetTemplate.serviceType;
    });
    state.manageList.forEach((da, i) => {
      if (da.widgetId == parentId) {
        da.children = [...da.children, ...dataList];
      }
    });
    const newManageList = JSON.parse(JSON.stringify(state.manageList));
    return {
      ...state,
      manageList: newManageList,
      isEdit: true,
    };
  },
  [getAllServicesByLabelGroup]: (state, { payload, error }) => {
    if (error) {
      return state;
    }
    const applicationsMap = {};
    payload.applications.forEach((da, i) => {
      applicationsMap[da.applicationId] = da;
      da.service.forEach((serviceDa, j) => {
        applicationsMap[serviceDa.serviceId] = serviceDa;
      });
    });
    setDefaultSelected(state.manageList, applicationsMap);
    return {
      ...state,
      applicationsMap,
      allServicesByLabelGroup: payload,
    };
  },
  [setCurrentSelectWidgetMap]: (state, { payload, error }) => ({
    ...state,
  }),
  [batchDelect]: (state, { payload }) => {
    let manageList = state.manageList;
    // 选中之后将id 都放到这个组中
    const selectList = state.selectList;
    const newList = [];
    manageList.forEach(({ children }) => {
      for (var i = 0, flag = true, len = children.length; i < len; flag ? i++ : i) {
        selectList.forEach((select) => {
          if (children[i] && children[i].widgetId === select) {
            children.splice(i, 1);
            flag = false;
          } else {
            flag = true;
          }
        });
      }
    });
    manageList = JSON.parse(JSON.stringify(manageList));
    return {
      ...state,
      manageList,
      selectList: [],
      selectGroup: [],
      isEdit: true,
      currEditonlyId: '',
    };
  },
  [batchMove]: (state, { payload: toGroupIndex }) => {
    let manageList = state.manageList;
    // 选中之后将id 都放到这个组中
    const selectList = state.selectList;
    const newList = [];
    manageList.forEach(({ children }) => {
      for (var i = 0, flag = true, len = children.length; i < len; flag ? i++ : i) {
        selectList.forEach((select) => {
          if (children[i] && children[i].widgetId === select) {
            newList.push(children[i]);
            children.splice(i, 1);
            flag = false;
          } else {
            flag = true;
          }
        });
      }
    });
    newList.forEach((item) => {
      manageList[toGroupIndex].children.push(item);
    });
    manageList = JSON.parse(JSON.stringify(manageList));
    return {
      ...state,
      manageList,
      selectList: [],
      selectGroup: [],
      isEdit: true,
      currEditonlyId: '',
    };
  },
  [selectGroupActions]: (state, { payload: selectGroup }) => ({
    ...state,
    selectGroup: [...selectGroup],
    currEditonlyId: '',
  }),
  [selectListActions]: (state, { payload: selectList }) => ({
    ...state,
    selectList,
    currEditonlyId: '',
  }),
  [addGroup]: (state, { payload: { index, widgetId, widgetName = '' } }) => {
    const manageList = state.manageList;
    const newGroup = {
      ...defaultGroup,
      widgetId: widgetId || guid(),
      widgetName,
      children: [],
    };
    manageList.splice(index + 1, 0, newGroup);
    return {
      ...state,
      manageList: [...manageList],
      selectGroup: [],
      selectList: [],
      isEdit: true,
      currEditonlyId: newGroup.widgetId,
    };
  },
  [delectGroup]: (state, { payload: index }) => {
    const manageList = state.manageList;
    const newList = manageList.filter((item, i) => index !== i);
    /* if (!newList.length) {
      newList.push({
        ...defaultGroup,
        children: [],
      })
    } */
    const children = manageList[index].children;
    children.forEach((da, i) => {
      delete state.currentSelectWidgetMap[da.widgetId];
    });
    return {
      ...state,
      manageList: newList,
      selectGroup: [],
      selectList: [],
      isEdit: true,
      currEditonlyId: '',
      currentSelectWidgetMap: state.currentSelectWidgetMap,
    };
  },
  [setCurrGroupIndex]: (state, { payload: index }) => ({
    ...state,
    currGroupIndex: index,
    // currEditonlyId:""
  }),
  [renameGroup]: (state, {
    payload: {
      name, index, id, dontChangeCurrEditonlyId,widgetNameMultiLangText,roleEditMultiLang
    },
  }) => {
    const manageList = state.manageList;
    let group;
    let currEditonlyId;
    if (typeof id !== 'undefined') {
      group = manageList.find(({ widgetId }) => widgetId === id);
    } else if (typeof index !== 'undefined') {
      group = manageList[index];
    }
    if (dontChangeCurrEditonlyId) {
      currEditonlyId = state.currEditonlyId;
    } else {
      currEditonlyId = '';
    }
    group.widgetName = name;
    group.isNew = false;
    if(roleEditMultiLang){
      group.widgetNameMultiLangText = {
        textMap:widgetNameMultiLangText
      }
     // group.widgetNameMultiLangText.textMap = widgetNameMultiLangText
    }
    return {
      ...state,
      manageList,
      isEdit: true,
      currEditonlyId,
    };
  },

  [stickGroup]: (state, { payload: index }) => {
    const manageList = state.manageList;
    const curr = manageList[index];
    const newList = manageList.filter((item, i) => index !== i);
    newList.unshift(curr);
    return {
      ...state,
      manageList: newList,
      isEdit: true,
      currEditonlyId: '',
    };
  },
  [moveTopGroup]: (state, { payload: index }) => {
    const manageList = state.manageList;
    const newList = swapItems(manageList, index, index - 1);
    return {
      ...state,
      manageList: [...newList],
      selectGroup: [],
      selectList: [],
      isEdit: true,
      currEditonlyId: '',
    };
  },
  [moveBottomGroup]: (state, { payload: index }) => {
    const manageList = state.manageList;
    const newList = swapItems(manageList, index, index + 1);
    return {
      ...state,
      manageList: [...newList],
      selectGroup: [],
      selectList: [],
      isEdit: true,
      currEditonlyId: '',
    };
  },

  [splitFolder]: (state, { payload: manageList }) => ({
    ...state,
    manageList,
    currEditonlyId: '',
  }),
  [addService]: (state, { payload: { index: groupIndex, service } }) => {
    const { manageList } = state;
    const group = manageList[groupIndex];
    group.children = group.children.concat(service);
    manageList.splice(groupIndex, 1, {
      ...group,
    });
    return {
      ...state,
      isEdit: true,
      manageList: [...manageList],
      currEditonlyId: '',
    };
  },
 

  [editTitle]: (state, { payload: { id, name } }) => {
    const manageList = state.manageList;
    // manageList = JSON.parse(JSON.stringify(manageList));
    return {
      ...state,
      title: name,
      drag: 'zoomIn',
      // manageList,
      manageList: [...manageList],
      currEditonlyId: '',
      // manageList: [...manageList],
    };
  },

  [openBatchMove]: state => ({
    ...state,
    batchMoveModalDisplay: true,
    currEditonlyId: '',
  }),
  [closeBatchMove]: state => ({
    ...state,
    batchMoveModalDisplay: false,
    currEditonlyId: '',
  }),
  [setEditState]: (state, { payload: isEdit }) => ({
    ...state,
    isEdit,
    currEditonlyId: '',
  }),

  [setEditonlyId]: (state, { payload: currEditonlyId }) => ({
    ...state,
    currEditonlyId,
  }),
  [returnDefaultState]: state => ({
    curEditFolderId: '',
    manageList: [],
    isEdit: false,
    isFocus: false,

    folderModalDisplay: false,
    batchMoveModalDisplay: false,
    selectList: [], // 勾选的服务列表
    // selectWidgetList:[],
    selectGroup: [],
    currGroupIndex: 0,
    currentSelectWidgetMap: {},
    title: '',
    currEditonlyId: '',

    applicationsMap: {},
    // selectWidgetItem:true,
    allServicesByLabelGroup: {},

    dragState: true, // 是否可拖拽
    isSiderDisplay: true,  //左侧默认展开
    shadowCard: {
      size: 1,
      type: 3,
      widgetId: "shadowCardId",
      widgetName: "item"
    },
    ifDifferentSizeExchanged: false,
    checkedCardList: [],
    layout: {
      containerWidth: 1200,
      containerHeight: 200,
      calWidth: 175,
      rowHeight: 175,
      col: 6,
      margin: [ 10, 10 ],
      containerPadding: [ 0, 0 ]
    },
    defaultLayout: {
      containerWidth: 1200,
      containerHeight: 200,
      calWidth: 175,
      rowHeight: 175,
      col: 6,
      margin: [ 10, 10 ],
      containerPadding: [ 0, 0 ]
    },
  }),
  [emptySelectGroup]: state => ({
    ...state,
    selectGroup: [],
  }),
}, defaultState);

export default reducer;
