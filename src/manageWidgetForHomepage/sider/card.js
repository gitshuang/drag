import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { hasCardContainInGroups } from '../utils';
import { mapStateToProps } from '../../utils';
import { list_item_content, title, isAddColor, title_name } from './style.css'
import manageActions from '../core/action';
const { updateManageList,updateShadowCard ,updateCheckedCardList} = manageActions;
import {addWidthAndHeight} from '../../utils'

const noteSource = {
    beginDrag(props, monitor, component) {

        const data = props.data;

        if (!data.checked) {//拖拽没被选择上的元素时，元素被push进checkedCardList
            props.checkedCardList.push(data);
            //component.clickSiderCard(true, data.parentId, data.menuItemId);
        }
        props.checkedCardList.forEach(element => {
            element.type = 3;
            element.widgetId = element.widgettemplateId;
            element.widgetName = element.templateName;
            Object.keys(element).forEach((item,index)=>{
                if(item.indexOf('templateName')>-1){
                    element[`widgetName${item.slice(12)}`]=element[item]
                }
            })
            element.serviceCode = element.templateCode
            element.size = element.size||1;
            element.serviceType = element.templateType
            addWidthAndHeight(element)
        });
        const dragCard = {
            isShadow:true,
            width:1,
            height:1,
            widgetId:"shadowCardId",
        };
        props.updateShadowCard(dragCard);
        return { id: "shadowCardId", type:"cardList", cardList: props.checkedCardList }  //3代表widget，parentId=2暂时代表侧边栏

    },
    endDrag(props, monitor, component) {
        const DraggedItem = monitor.getItem();
        const { manageList, updateManageList } = props;
        if (!monitor.didDrop()) {//进去又出来,monitor.didDrop()//false

                manageList.forEach(item => {
                    item.children.forEach((a, b) => {
                        if (a.widgetId == DraggedItem.id) {
                            item.children.splice(b, 1)
                        }
                    })
                })
            updateManageList(manageList);
            //压根没进去的情况
            props.updateCheckedCardList([])
        } else {//拖进去了
            console.log("正常拖拽")//
        }
    },
    canDrag(props, monitor) {
        const { manageList, data } = props;
        if (hasCardContainInGroups(manageList, data.templateCode)) {
            return false
        }
        return true
    }
};

@connect(
    mapStateToProps(
        'manageList',
        'checkedCardList',
        {
            namespace: 'managewidget',
        },
    ),
    {
        updateManageList,
        updateShadowCard,
        updateCheckedCardList
    }
)
@DragSource('item', noteSource, (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
})
export default class Card extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.connectDragPreview(getEmptyImage(), {
            captureDraggingState: true
        });
    }

    shouldComponentUpdate(nextProps,nextState){//优化：只有checked变化是才更新组件
        if(nextProps.data.checked!==this.props.data.checked)return true;
        const isContain = hasCardContainInGroups(this.props.manageList, this.props.data.templateCode)
        const isNextContain = hasCardContainInGroups(nextProps.manageList, nextProps.data.templateCode);
        if (isContain!=isNextContain) {
    		return true;
        }
        return false
    }

    //改变SiderCard的选中状态
    clickSiderCard = () => {
        const { templateCode, parentId, checked } = this.props.data;
        this.props.onChangeChecked(!checked, parentId, templateCode);
    };

    render() {

        const { connectDragSource, manageList} = this.props;
        const { templateName,templateCode,/*service:{serviceName,serviceCode},*/ checked } = this.props.data;
        const isContainInGroups = hasCardContainInGroups(manageList, templateCode);
        return connectDragSource(
            <div>
                {
                    isContainInGroups
                        ?
                        <div className="app_col" >
                        <div className={`${list_item_content} ${title} ${isAddColor}`}>
                            <span className={title_name} >{templateName}</span>
                        </div>
                        </div>
                        :
                        <div className="app_col" onClick={this.clickSiderCard}>
                        <div className={`${list_item_content} ${title} ${checked ? 'item-checked' : null}`}>
                            <span className={title_name}  title={templateName}>{templateName}</span>

                                <i
                                    className={checked?"selected":null}
                                    style={{ color: 'rgb(0, 122, 206)' }}
                                ></i>

                        </div>
                        </div>

                }


            </div>
        );
    }
}



